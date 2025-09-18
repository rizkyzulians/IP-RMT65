import React, { useState, useEffect } from "react";

function CardDetail({ recipe }) {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    function check() {
      setIsNarrow(window.innerWidth < 768);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!recipe) return null;
  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div className="card mb-3 shadow-lg border-0" style={{ width: '100%', minWidth: 320, minHeight: 320, borderRadius: 22, background: 'linear-gradient(135deg, #f8ffec 60%, #ffe5b4 100%)', overflow: 'hidden', display: 'flex', flexDirection: isNarrow ? 'column' : 'row', alignItems: 'flex-start', boxSizing: 'border-box', boxShadow: '0 8px 32px #e0e0c0', gap: isNarrow ? 0 : 28 }}>
        <div style={{ flex: isNarrow ? '0 0 auto' : '0 0 370px', width: isNarrow ? '100%': undefined, height: isNarrow ? 220 : '100%', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: isNarrow ? 220 : '100%',
              maxWidth: isNarrow ? '100%' : '100%',
              borderRadius: isNarrow ? '12px 12px 0 0' : '18px 18px 18px 18px',
              boxShadow: '0 2px 12px #c8e6c9',
              display: 'block'
            }}
          />
        </div>
  <div style={{ flex: 1, minHeight: isNarrow ? 'auto' : 340, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', padding: isNarrow ? '16px' : '32px 32px 32px 0', gap: 10, paddingLeft: isNarrow ? 0 : 12 }}>
          <h2 className="card-title" style={{ color: '#388e3c', fontSize: isNarrow ? '1.6rem' : '2.3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>{recipe.title}</h2>
          <p className="card-text" style={{ color: '#ff9800', fontSize: isNarrow ? '1rem' : '1.13rem', marginBottom: 12 }}>{recipe.summary}</p>
          <div style={{ marginBottom: 8, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: isNarrow ? '1rem' : '1.15rem', color: '#333' }}>Ingredients:</div>
            <div style={{ fontSize: isNarrow ? '0.95rem' : '1.08rem', marginTop: 6 }}>{recipe.ingredients}</div>
          </div>
          <div style={{ width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: isNarrow ? '1rem' : '1.15rem', color: '#333' }}>Instructions:</div>
            <div style={{ fontSize: isNarrow ? '0.95rem' : '1.08rem', marginTop: 6 }}>{recipe.instructions}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDetail;
