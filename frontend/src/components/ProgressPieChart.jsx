import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressPieChart = ({ open, inProgress, resolved, total }) => {
  const percent = (count) => (total === 0 ? 0 : Math.round((count / total) * 100));

  const data = {
    labels: ['Open', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [
          percent(open),
          percent(inProgress),
          percent(resolved),
        ],
        backgroundColor: ['#fdcb6e', '#0984e3', '#00b894'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: "'Segoe UI', sans-serif", size: 14, weight: 'bold', colo: '#2d3436' },
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = data.labels[context.dataIndex];
            const value = data.datasets[0].data[context.dataIndex];
            return `${label}: ${value}%`;
          },
        },
        bodyFont: { family: "'Segoe UI', sans-serif", size: 13, weight: '500' },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '220px' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default ProgressPieChart;
