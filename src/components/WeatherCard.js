import React from 'react';

function WeatherCard({ dayData, formatDay, humidity, windSpeed, feelsLike, unitSymbol = '°C', windUnit = 'm/s' }) {
  return (
    <div className="day-card">
      <h3>{formatDay(dayData.dt)}</h3>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{dayData.main.temp}{unitSymbol}</p>
      <p className="meta" style={{ textTransform:'capitalize' }}>{dayData.weather[0].description}</p>
      <img
        src={`http://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`}
        alt={dayData.weather[0].description}
      />
      <div className="additional-info">
        <p><strong>Humedad:</strong> {humidity}%</p>
        <p><strong>Viento:</strong> {windSpeed} {windUnit}</p>
        <p><strong>Sensación:</strong> {feelsLike}{unitSymbol}</p>
      </div>
    </div>
  );
}

export default WeatherCard;
