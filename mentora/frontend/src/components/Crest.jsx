export default function Crest({ size = 32, color = '#C9A24B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 3L34 9V19C34 27.5 28 33.8 20 37C12 33.8 6 27.5 6 19V9L20 3Z"
        stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
      <path
        d="M13 20.5L17.5 25L27.5 14.5"
        stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
