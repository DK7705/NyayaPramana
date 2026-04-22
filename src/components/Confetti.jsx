export default function Confetti({ show }) {
  if (!show) return null;
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${Math.random() * 100}%`,
          top: '-10px',
          background: ['#F7C948', '#FF6B35', '#E8719A', '#0ABFBC', '#7C3AED'][Math.floor(Math.random() * 5)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animationDuration: `${1.5 + Math.random() * 2}s`,
          animationDelay: `${Math.random() * 0.5}s`,
        }} />
      ))}
    </>
  );
}
