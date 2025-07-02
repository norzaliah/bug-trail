// src/components/ProgressPieChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressPieChart = ({ completed, onHold, delayed, canceled, total }) => {
  const overdue = delayed + canceled;
  const inProgress = completed; // Treat completed as "in progress" shown in blue

  const percent = (count) => Math.round((count / total) * 100);

  const data = {
    labels: ['In Progress', 'On Hold', 'Overdue'],
    datasets: [
      {
        data: [percent(inProgress), percent(onHold), percent(overdue)],
        backgroundColor: ['#0984e3', '#fdcb6e', '#d63031'],
        borderColor: '#fff',
        borderWidth: 1,
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
          color: '#000',
          boxWidth: 12,
          padding: 16,
          font: {
            size: 14,
            weight: '600',
            family: "'Segoe UI', sans-serif",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = data.labels[tooltipItem.dataIndex];
            const value = data.datasets[0].data[tooltipItem.dataIndex];
            return `${label}: ${value}%`;
          },
        },
        bodyFont: {
          family: "'Segoe UI', sans-serif",
          size: 13,
          weight: '500',
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default ProgressPieChart;