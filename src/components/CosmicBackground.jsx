export default function CosmicBackground() {
  return (
    <div className="cosmic-bg">
      <div className="mandala-bg" />
      <div className="floating-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 8}s`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            background: ['#F7C948', '#FF6B35', '#E8719A', '#0ABFBC'][Math.floor(Math.random() * 4)],
          }} />
        ))}
      </div>
    </div>
  );
}
