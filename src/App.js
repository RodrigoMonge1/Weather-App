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

  // Favoritos (array de strings con el nombre de ciudad)
  const [favorites, setFavorites] = useState([]);

  // Cargar favoritos y última ciudad al montar
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
  }, []);

  // Guardar favoritos cuando cambian
  useEffect(() => {
    localStorage.setItem(LS_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  // Guardar última ciudad cuando hay resultado válido
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

  // Geolocalización
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
      (err) => {
        console.error(err);
        alert('No se pudo obtener tu ubicación. Revisa permisos del navegador.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Clave legible de la ciudad actual para favoritos
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

  // Próximos 6 días (excluye hoy)
  const nextSix = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    return arr.slice(1, 7);
  };

  return (
    <div className="weather-container">
      <h1>Weather App</h1>

      {/* Barra de favoritos */}
      <FavoritesBar
        favorites={favorites}
        onSelect={selectFavorite}
        onRemove={removeFavorite}
      />

      {/* Controles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={toggleUnits}>
          Cambiar a {units === 'metric' ? '°F' : '°C'}
        </button>
        <button onClick={handleUseMyLocation}>
          Usar mi ubicación
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ingresa una ciudad"
          style={{ flex: 1 }}
        />
        <button onClick={handleSearch} disabled={loading}>Obtener clima</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Cargando...</p>}

      {/* Clima de hoy */}
      {weatherData && (
        <div className="weather-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <h2 style={{ margin: 0 }}>
              {weatherData.name}, {weatherData.sys.country}
            </h2>
            <button
              onClick={toggleFavorite}
              title={isCurrentFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #ddd',
                background: isCurrentFavorite ? '#ffe08a' : 'white',
                cursor: 'pointer',
              }}
            >
              {isCurrentFavorite ? '★' : '☆'}
            </button>
          </div>

          <p>Temperatura: {weatherData.main.temp}{unitSymbol}</p>
          <p>{weatherData.weather[0].description}</p>
          <img
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
            alt={weatherData.weather[0].description}
          />

          <div className="additional-info">
            <p><strong>Humedad:</strong> {weatherData.main.humidity}%</p>
            <p><strong>Viento:</strong> {weatherData.wind.speed} {windUnit}</p>
            <p><strong>Sensación térmica:</strong> {weatherData.main.feels_like}{unitSymbol}</p>
          </div>

          {/* Calidad del aire */}
          <AQIBadge aqiData={aqiData} />
        </div>
      )}

      {/* Gráfico semanal */}
      {weeklyData.length > 0 && (
        <WeatherChart weeklyData={weeklyData} unitSymbol={unitSymbol} />
      )}

      {/* Cards: próximos 6 días */}
      <div className="weekly-forecast">
        {weeklyData.length > 1 && (
          <div className="days-container">
            {nextSix(weeklyData).map((dayData, index) => (
              <WeatherCard
                key={index}
                dayData={dayData}
                formatDay={formatDay}
                humidity={dayData.main?.humidity}
                windSpeed={dayData.wind?.speed}
                feelsLike={dayData.main?.feels_like}
                unitSymbol={unitSymbol}
                windUnit={windUnit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Utilidad para mostrar nombre del día
const formatDay = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return days[date.getDay()];
};

export default App;
