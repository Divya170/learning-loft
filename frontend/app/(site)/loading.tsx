export default function Loading() {
  return (
    <div className="wrap stack" style={{ gap: 24, paddingBlock: 'clamp(40px,6vw,88px)' }} aria-busy="true" aria-label="Loading page">
      <div className="skeleton" style={{ height: 22, width: 180 }} />
      <div className="skeleton" style={{ height: 'clamp(56px,7vw,96px)', width: '75%' }} />
      <div className="skeleton" style={{ height: 24, width: '55%' }} />
      <div className="auto" style={{ marginTop: 24 }}>
        {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 280 }} />)}
      </div>
    </div>
  );
}
