import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { OWM_API_KEY as API_KEY } from '../config';

function CityAutocomplete({ value, onChange, onSelect, disabled = false }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(value)}&limit=5&appid=${API_KEY}`;
        const { data } = await axios.get(url);
        const mapped = (data || []).map((c) => ({
          name: c.name,
          state: c.state,
          country: c.country,
          lat: c.lat,
          lon: c.lon,
          display: [c.name, c.state, c.country].filter(Boolean).join(', '),
        }));
        setSuggestions(mapped);
        setOpen(mapped.length > 0);
      } catch (e) {
        console.error('Geo suggest error:', e);
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  // cerrar al click fuera
  useEffect(() => {
    const handler = (ev) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(ev.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (sug) => {
    onSelect?.(sug); // {display, lat, lon, ...}
    setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Ingresa una ciudad"
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 4,
          border: '1px solid #ccc',
          color: '#111',
          background: '#fff',
        }}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && suggestions[0]) handleSelect(suggestions[0]);
        }}
      />

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%', left: 0, right: 0,
            background: '#fff', color: '#111',
            border: '1px solid #e5e7eb', borderTop: 'none',
            zIndex: 1000,
            borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
            maxHeight: 240, overflowY: 'auto',
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          }}
        >
          {loading && (
            <div style={{ padding: 8, fontSize: 14, color: '#6b7280' }}>Buscando...</div>
          )}
          {!loading && suggestions.length === 0 && (
            <div style={{ padding: 8, fontSize: 14, color: '#6b7280' }}>Sin resultados</div>
          )}
          {suggestions.map((s) => (
            <button
              key={`${s.display}-${s.lat}-${s.lon}`}
              onClick={() => handleSelect(s)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                background: '#fff',
                color: '#111',
                border: 'none',
                borderTop: '1px solid #f3f4f6',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              {s.display}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;
