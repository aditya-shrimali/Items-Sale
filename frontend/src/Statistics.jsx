import { useEffect, useState } from 'react'
import PropTypes from "prop-types";

const Statistics = ({month}) => {
    const [statistics, setStatistics] = useState({
        totalSaleAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
      });
    
      useEffect(() => {
        fetchStatistics();
      }, [month]);

      const fetchStatistics = () => {
        // Replace with your actual API endpoint
        fetch(`http://localhost:3000/statistics?month=${month}`)
          .then(response => response.json())
          .then(data => {
            console.log(statistics)
            setStatistics(data);
          })
          .catch(error => {
            console.error('Error fetching statistics:', error);
          });
      };

  return (
    <div className="statistics-container">
      <h2 className="statistics-header">Statistics - {month.toUpperCase()}</h2>
      <div className="statistics">
        <div className="statistic-box" id="totalAmount">
          <h3>Total Sale Amount</h3>
          <span>₹{statistics.totalSaleAmount.toFixed(2)}</span>
        </div>

        <div className="statistic-box" id="totalSoldItems">
          <h3>Total Sold Items</h3>
          <span>{statistics.totalSoldItems}</span>
        </div>

        <div className="statistic-box" id="totalNotSoldItems">
          <h3>Total Not Sold Items</h3>
          <span>{statistics.totalNotSoldItems}</span>
        </div>
      </div>
    </div>
  )
}

Statistics.propTypes = {
    month: PropTypes.string.isRequired,
  };

export default Statistics
