import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import PropTypes from 'prop-types';

const BarChart = ({ month }) => {
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    fetchBarChartData();
  }, [month]);

  const fetchBarChartData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/bar-chart?month=${month}`);
      const data = await response.json();
      setBarChartData(data);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  const options = {
    chart: {
      type: 'bar',
      background: '#fff', // Background color
      foreColor: '#333', // Font color
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: barChartData.map(item => item.range),
      labels: {
        style: {
          colors: '#555', // X-axis label color
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Items',
        style: {
          color: '#555', // Y-axis title color
        },
      },
      labels: {
        style: {
          colors: '#555', // Y-axis label color
        },
      },
    },
  };

  const series = [
    {
      name: 'Number of Items',
      data: barChartData.map(item => item.count),
    },
  ];

  return (
    <div className="bar-chart-container">
      <h2 className="chart-title">Bar Chart Stats - {month.toUpperCase()}</h2>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

BarChart.propTypes = {
  month: PropTypes.string.isRequired,
};

export default BarChart;
