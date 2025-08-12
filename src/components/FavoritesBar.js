import React from 'react';

function FavoritesBar({ favorites = [], onSelect, onRemove }) {
  if (!favorites.length) return null;

  return (
    <div className="favs">
      <span className="favs-label">Favoritos:</span>
      {favorites.map((city) => (
        <div key={city} className="chip">
          <button onClick={() => onSelect(city)} title={`Ver ${city}`}>
            {city}
          </button>
          <button className="close" onClick={() => onRemove(city)} title="Quitar">×</button>
        </div>
      ))}
    </div>
  );
}

export default FavoritesBar;
