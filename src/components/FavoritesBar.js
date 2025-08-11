import React from 'react';

function FavoritesBar({ favorites = [], onSelect, onRemove }) {
  if (!favorites.length) return null;

  return (
    <div style={{
      marginBottom: 12,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <span style={{ fontWeight: 'bold' }}>Favoritos:</span>
      {favorites.map((city) => (
        <div
          key={city}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#b6b7b7ff',
            border: '1px solid #e2e8f0',
            borderRadius: 999,
            padding: '6px 10px',
          }}
        >
          <button
            onClick={() => onSelect(city)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
            title={`Ver ${city}`}
          >
            {city}
          </button>
          <button
            onClick={() => onRemove(city)}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 999,
              padding: '2px 6px',
              cursor: 'pointer'
            }}
            title="Quitar de favoritos"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default FavoritesBar;
