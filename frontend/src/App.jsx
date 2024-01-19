import { useEffect, useState } from "react";
import "./App.css";
import Table from "../../Table";
import Statistics from "./Statistics";
import BarChart from "./BarChart";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState("march");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/transactions?month=${month}&search=${search}`
        );
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [month, search]);

  return (
      <section className="main">
        <div className="circle">
          <p>Transaction Dashboard</p>
        </div>
        <div className="setter">
          <input
            type="text"
            placeholder="Search Transaction"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            name="month"
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="select"
          >
            <option value="january">January</option>
            <option value="february">February</option>
            <option value="march">March</option>
            <option value="april">April</option>
            <option value="may">May</option>
            <option value="june">June</option>
            <option value="july">July</option>
            <option value="august">August</option>
            <option value="september">September</option>
            <option value="october">October</option>
            <option value="november">November</option>
            <option value="december">December</option>
          </select>
        </div>
        <div className="table">
          <Table transactions={transactions}/>
        </div>
        <br></br>
        <Statistics month={month}/>
        <br></br>
        <BarChart month={month}/>
      </section>
  );
}

export default App;
