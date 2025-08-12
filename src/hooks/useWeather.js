import { useCallback, useState } from 'react';
import axios from 'axios';
import { OWM_API_KEY as API_KEY } from '../config';

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [aqiData, setAqiData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const buildDailyFromList = (list) => {
    if (!Array.isArray(list)) return [];
    const byDate = new Map();
    for (const item of list) {
      const d = new Date(item.dt * 1000);
      const key = d.toISOString().slice(0, 10);
      const hour = d.getUTCHours();
      const score = Math.abs(hour - 12);
      const current = byDate.get(key);
      if (!current || score < current.score) byDate.set(key, { item, score });
    }
    return Array.from(byDate.values())
      .map(v => v.item)
      .sort((a, b) => a.dt - b.dt)
      .slice(0, 7);
  };

  const fetchAQI = useCallback(async (lat, lon) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const { data } = await axios.get(url);
      const first = data?.list?.[0];
      if (first) {
        setAqiData({
          aqi: first.main.aqi,
          components: first.components || {},
        });
      } else {
        setAqiData(null);
      }
    } catch (e) {
      console.error('Error fetching AQI:', e);
      setAqiData(null);
    }
  }, []);

  const fetchWeather = useCallback(async (city, units = 'metric') => {
    if (!city) return;
    setLoading(true);
    setError('');
    setAqiData(null);

    const q = encodeURIComponent(city);
    const urlCurrent  = `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${API_KEY}&units=${units}`;
    const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${API_KEY}&units=${units}`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(urlCurrent),
        axios.get(urlForecast),
      ]);
      setWeatherData(currentResponse.data);
      setWeeklyData(buildDailyFromList(forecastResponse.data.list || []));

      const { coord } = currentResponse.data || {};
      if (coord?.lat != null && coord?.lon != null) {
        await fetchAQI(coord.lat, coord.lon);
      }
    } catch (err) {
      console.error('Error fetching city weather:', err);
      setError('Ciudad no encontrada o error en la API');
      setWeatherData(null);
      setWeeklyData([]);
      setAqiData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchAQI]);

  const fetchWeatherByCoords = useCallback(async (lat, lon, units = 'metric') => {
    if (lat == null || lon == null) return;
    setLoading(true);
    setError('');
    setAqiData(null);

    const urlCurrent  = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(urlCurrent),
        axios.get(urlForecast),
      ]);
      setWeatherData(currentResponse.data);
      setWeeklyData(buildDailyFromList(forecastResponse.data.list || []));
      await fetchAQI(lat, lon);
    } catch (err) {
      console.error('Error fetching coords weather:', err);
      setError('No se pudo obtener clima por ubicación.');
      setWeatherData(null);
      setWeeklyData([]);
      setAqiData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchAQI]);

  return { weatherData, weeklyData, aqiData, error, loading, fetchWeather, fetchWeatherByCoords };
};

export default useWeather;
