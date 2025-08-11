import { useState } from 'react';
import axios from 'axios';

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reutilizamos esta función para convertir la lista de 3h en 1 punto diario (≈mediodía) hasta 7 días
  const buildDailyFromList = (list) => {
    if (!Array.isArray(list)) return [];
    const byDate = new Map();
    for (const item of list) {
      const d = new Date(item.dt * 1000);           // UTC
      const key = d.toISOString().slice(0, 10);     // YYYY-MM-DD
      const hour = d.getUTCHours();
      const score = Math.abs(hour - 12);            // cercanía a 12:00
      const current = byDate.get(key);
      if (!current || score < current.score) byDate.set(key, { item, score });
    }
    return Array.from(byDate.values())
      .map(v => v.item)
      .sort((a, b) => a.dt - b.dt)
      .slice(0, 7);
  };

  // Buscar por nombre de ciudad
  const fetchWeather = async (city, units = 'metric') => {
    if (!city) return;

    setLoading(true);
    setError('');

    const apiKey = '524558ff1e3ebd4792f84b99962f9624'; // <-- usa tu key aquí (.env recomendado)
    const q = encodeURIComponent(city);
    const urlCurrent  = `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${apiKey}&units=${units}`;
    const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${apiKey}&units=${units}`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(urlCurrent),
        axios.get(urlForecast),
      ]);
      setWeatherData(currentResponse.data);
      setWeeklyData(buildDailyFromList(forecastResponse.data.list || []));
    } catch (err) {
      console.error('Error fetching city weather:', err);
      setError('Ciudad no encontrada o error en la API');
      setWeatherData(null);
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar por coordenadas (geolocalización)
  const fetchWeatherByCoords = async (lat, lon, units = 'metric') => {
    if (lat == null || lon == null) return;

    setLoading(true);
    setError('');

    const apiKey = '524558ff1e3ebd4792f84b99962f9624'; // <-- usa tu key aquí (.env recomendado)
    const urlCurrent  = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(urlCurrent),
        axios.get(urlForecast),
      ]);
      setWeatherData(currentResponse.data);
      setWeeklyData(buildDailyFromList(forecastResponse.data.list || []));
    } catch (err) {
      console.error('Error fetching coords weather:', err);
      setError('No se pudo obtener clima por ubicación.');
      setWeatherData(null);
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    weatherData,
    weeklyData,
    error,
    loading,
    fetchWeather,
    fetchWeatherByCoords, // <- exportamos también esto
  };
};

export default useWeather;
