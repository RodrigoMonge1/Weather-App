import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const formatDay = (ts) => {
  const d = new Date(ts * 1000);
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return days[d.getDay()];
};

function WeatherChart({ weeklyData, unitSymbol = '°C' }) {
  if (!weeklyData || weeklyData.length === 0) return null;

  const data = {
    labels: weeklyData.map(d => formatDay(d.dt)),
    datasets: [
      {
        label: `Temperatura semanal (${unitSymbol})`,
        data: weeklyData.map(d => d.main.temp),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={data} />;
}

export default WeatherChart;
