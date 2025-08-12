import React from 'react';

const levelInfo = (aqi) => {
  switch (aqi) {
    case 1: return { text: 'Bueno', cls: 'aqi-good' };
    case 2: return { text: 'Aceptable', cls: 'aqi-okay' };
    case 3: return { text: 'Moderado', cls: 'aqi-mid' };
    case 4: return { text: 'Malo', cls: 'aqi-bad' };
    case 5: return { text: 'Muy malo', cls: 'aqi-worse' };
    default: return { text: 'N/D', cls: '' };
  }
};

function AQIBadge({ aqiData }) {
  if (!aqiData) return null;
  const { aqi, components = {} } = aqiData;
  const { text, cls } = levelInfo(aqi);

  return (
    <div className="aqi">
      <span className={`aqi-badge ${cls}`}>AQI: {aqi} — {text}</span>
      <div className="meta" style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
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
