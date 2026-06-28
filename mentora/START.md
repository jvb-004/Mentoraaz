# Mentora - Başlamaq üçün

## Tələblər
- Node.js 18+ (nodejs.org-dan yükləyin)

## Qurulum (bir dəfəlik)

```bash
# Backend
cd backend
npm install
cp .env.example .env
# .env faylını mətn redaktoru ilə aç, JWT_SECRET-i dəyiş, ADMIN_EMAILS-i özününkü et

# Frontend
cd ../frontend
npm install
```

## Hər gün işə salmaq

Terminal 1 - backend:
```bash
cd backend
node server.js
```

Terminal 2 - frontend:
```bash
cd frontend
npm run dev
```

Brauzderdə aç: http://localhost:5173

## İstifadə qaydası

1. http://localhost:5173/signup - hesab yarat
2. Mütəxəssis qeydiyyatı: "Mən mütəxəssisəm" seç
3. Profil → Sənəd yüklə
4. Admin panelindən (ADMIN_EMAILS-dəki hesabla) sənədi təsdiqlə: /admin
5. Profil axtarışda görünür
