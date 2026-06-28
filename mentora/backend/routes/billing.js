const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');

// Pricing config (single source of truth)
const PRICING = {
  boost: { amount: 1500, currency: 'azn', days: 7, label: '7 günlük Boost' },
  pro_monthly: { amount: 1200, currency: 'azn', label: 'Mentora Pro - aylıq' },
};

// NOTE on payments: Stripe does not yet support payouts to Azerbaijan-based businesses
// (confirmed via research). This module is built so the *logic* (what unlocks what, for
// how long) is fully real and working now using a mock/test charge path. Swapping in a
// real charge call (Stripe, or a local AZ payment gateway once the business entity is
// registered in a supported jurisdiction) only requires replacing createMockCharge
// below with a real provider call - nothing else in the app needs to change.

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

async function createCharge({ amount, currency, description }) {
  if (stripe) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, currency, description,
      payment_method_types: ['card'],
      confirm: false,
    });
    return { id: paymentIntent.id, status: paymentIntent.status, mock: false };
  }
  return { id: 'mock_' + Date.now(), status: 'succeeded', mock: true };
}

router.get('/pricing', (req, res) => {
  res.json({ pricing: PRICING });
});

router.post('/boost', requireAuth, async (req, res) => {
  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(req.userId);
  if (!tutor) return res.status(404).json({ error: 'Mütəxəssis profili yoxdur' });
  if (tutor.verification_status !== 'verified') {
    return res.status(403).json({ error: 'Boost almaq üçün profilin təsdiqlənməlidir' });
  }

  const charge = await createCharge({
    amount: PRICING.boost.amount,
    currency: PRICING.boost.currency,
    description: `Mentora Boost - tutor #${tutor.id}`,
  });

  const endsAt = new Date(Date.now() + PRICING.boost.days * 24 * 60 * 60 * 1000).toISOString();

  const result = db.prepare(
    'INSERT INTO boosts (tutor_id, ends_at, stripe_payment_id) VALUES (?, ?, ?)'
  ).run(tutor.id, endsAt, charge.id);

  res.status(201).json({
    boostId: Number(result.lastInsertRowid),
    endsAt,
    charge,
  });
});

router.get('/boost/status', requireAuth, (req, res) => {
  const tutor = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(req.userId);
  if (!tutor) return res.status(404).json({ error: 'Mütəxəssis profili yoxdur' });

  const activeBoost = db.prepare(
    `SELECT * FROM boosts WHERE tutor_id = ? AND ends_at > datetime('now') ORDER BY ends_at DESC LIMIT 1`
  ).get(tutor.id);

  res.json({ isBoosted: !!activeBoost, boost: activeBoost || null });
});

router.post('/subscribe', requireAuth, async (req, res) => {
  const existing = db.prepare(
    `SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'`
  ).get(req.userId);
  if (existing) return res.status(409).json({ error: 'Artıq aktiv abunəliyin var' });

  const charge = await createCharge({
    amount: PRICING.pro_monthly.amount,
    currency: PRICING.pro_monthly.currency,
    description: `Mentora Pro - user #${req.userId}`,
  });

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const result = db.prepare(`
    INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id, current_period_end)
    VALUES (?, 'pro', 'active', ?, ?)
  `).run(req.userId, charge.id, periodEnd);

  res.status(201).json({ subscriptionId: Number(result.lastInsertRowid), periodEnd, charge });
});

router.post('/cancel', requireAuth, (req, res) => {
  db.prepare(`UPDATE subscriptions SET status = 'canceled' WHERE user_id = ? AND status = 'active'`)
    .run(req.userId);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const sub = db.prepare(
    `SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`
  ).get(req.userId);
  res.json({ subscription: sub || null, isPro: !!sub });
});

module.exports = router;
