import React from 'react';

const levelInfo = (aqi) => {
  switch (aqi) {
    case 1: return { text: 'Bueno', color: '#22c55e' };
    case 2: return { text: 'Aceptable', color: '#84cc16' };
    case 3: return { text: 'Moderado', color: '#eab308' };
    case 4: return { text: 'Malo', color: '#f97316' };
    case 5: return { text: 'Muy malo', color: '#ef4444' };
    default: return { text: 'N/D', color: '#94a3b8' };
  }
};

function AQIBadge({ aqiData }) {
  if (!aqiData) return null;
  const { aqi, components = {} } = aqiData;
  const { text, color } = levelInfo(aqi);

  return (
    <div style={{
      marginTop: 12,
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 12,
      background: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: 999,
          background: color,
          color: 'white',
          fontWeight: 700
        }}>
          AQI: {aqi} — {text}
        </span>
      </div>

      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {'pm2_5' in components && <span><strong>PM2.5:</strong> {components.pm2_5} µg/m³</span>}
        {'pm10'  in components && <span><strong>PM10:</strong> {components.pm10} µg/m³</span>}
        {'o3'    in components && <span><strong>O₃:</strong> {components.o3} µg/m³</span>}
        {'no2'   in components && <span><strong>NO₂:</strong> {components.no2} µg/m³</span>}
        {'so2'   in components && <span><strong>SO₂:</strong> {components.so2} µg/m³</span>}
        {'co'    in components && <span><strong>CO:</strong> {components.co} µg/m³</span>}
      </div>
    </div>
  );
}

export default AQIBadge;
