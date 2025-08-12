import React, { useEffect, useState } from 'react';
import './App.css';
import WeatherCard from './components/WeatherCard';
import WeatherChart from './components/WeatherChart';
import FavoritesBar from './components/FavoritesBar';
import AQIBadge from './components/AQIBadge';
import useWeather from './hooks/useWeather';

const LS_KEYS = {
  favorites: 'weather_favorites',
  lastCity: 'weather_last_city',
};

function App() {
  const [city, setCity] = useState('');
  const {
    weatherData,
    weeklyData,
    aqiData,
    error,
    loading,
    fetchWeather,
    fetchWeatherByCoords,
  } = useWeather();

  const [units, setUnits] = useState('metric'); // 'metric' | 'imperial'
  const unitSymbol = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const favRaw = localStorage.getItem(LS_KEYS.favorites);
      const fav = favRaw ? JSON.parse(favRaw) : [];
      setFavorites(Array.isArray(fav) ? fav : []);
    } catch {
      setFavorites([]);
    }
    const last = localStorage.getItem(LS_KEYS.lastCity);
    if (last && last.trim()) {
      setCity(last);
      fetchWeather(last, units);
    }
  }, [fetchWeather, units]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (weatherData?.name) {
      localStorage.setItem(LS_KEYS.lastCity, `${weatherData.name}`);
    }
  }, [weatherData]);

  const handleSearch = () => fetchWeather(city, units);

  const toggleUnits = () => {
    const next = units === 'metric' ? 'imperial' : 'metric';
    setUnits(next);
    if (city) fetchWeather(city, next);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude, units);
      },
      () => alert('No se pudo obtener tu ubicación. Revisa permisos del navegador.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const currentCityKey = weatherData ? `${weatherData.name}` : '';
  const isCurrentFavorite = currentCityKey && favorites.includes(currentCityKey);

  const toggleFavorite = () => {
    if (!currentCityKey) return;
    setFavorites((prev) =>
      prev.includes(currentCityKey)
        ? prev.filter((c) => c !== currentCityKey)
        : [...prev, currentCityKey]
    );
  };

  const selectFavorite = (favCity) => {
    setCity(favCity);
    fetchWeather(favCity, units);
  };
  const removeFavorite = (favCity) => {
    setFavorites((prev) => prev.filter((c) => c !== favCity));
  };

  const nextSix = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    return arr.slice(1, 7);
  };

  return (
    <div className="weather-container">
      <h1 className="app-title">Weather App</h1>
      <p className="subtle">Pronóstico claro y elegante</p>

      {/* Favoritos */}
      <FavoritesBar
        favorites={favorites}
        onSelect={selectFavorite}
        onRemove={removeFavorite}
      />

      {/* Controles */}
      <div className="controls">
        <button className="btn" onClick={toggleUnits}>
          Cambiar a {units === 'metric' ? '°F' : '°C'}
        </button>
        <button className="btn secondary" onClick={handleUseMyLocation}>
          Usar mi ubicación
        </button>
      </div>

      {/* Búsqueda */}
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Busca una ciudad (p. ej., Lima, PE)"
        />
        <button className="btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Cargando...' : 'Obtener clima'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Panel HOY */}
      {weatherData && (
        <div className="panel center weather-info">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <h2>{weatherData.name}, {weatherData.sys.country}</h2>
            <button
              className="btn secondary"
              onClick={toggleFavorite}
              title={isCurrentFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              style={{ padding:'6px 10px' }}
            >
              {isCurrentFavorite ? '★' : '☆'}
            </button>
          </div>

          <p className="meta">Temperatura: <strong>{weatherData.main.temp}{unitSymbol}</strong></p>
          <p className="meta">{weatherData.weather[0].description}</p>
          <img className="icon-big"
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
            alt={weatherData.weather[0].description}
          />

          <div className="additional-info">
            <p><strong>Humedad:</strong> {weatherData.main.humidity}%</p>
            <p><strong>Viento:</strong> {weatherData.wind.speed} {windUnit}</p>
            <p><strong>Sensación térmica:</strong> {weatherData.main.feels_like}{unitSymbol}</p>
          </div>

          {/* AQI */}
          <AQIBadge aqiData={aqiData} />
        </div>
      )}

      {/* Gráfico semanal */}
      {weeklyData.length > 0 && (
        <div className="panel chart-card">
          <WeatherChart weeklyData={weeklyData} unitSymbol={unitSymbol} />
        </div>
      )}

      {/* Próximos 6 días */}
      <div className="weekly-forecast">
        <div className="days-container">
          {weeklyData.length > 1 &&
            nextSix(weeklyData).map((dayData, index) => (
              <WeatherCard
                key={dayData.dt ?? index}
                dayData={dayData}
                formatDay={formatDay}
                humidity={dayData.main?.humidity}
                windSpeed={dayData.wind?.speed}
                feelsLike={dayData.main?.feels_like}
                unitSymbol={unitSymbol}
                windUnit={windUnit}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}

const formatDay = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return days[date.getDay()];
};

export default App;
