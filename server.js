const express = require("express");
const mongoose = require("mongoose");
const cors=require("cors");
const { default: axios } = require("axios");
const app = express();
app.use(cors());

mongoose.connect(
  // "clustor0"
);


//Defining the schema for transaction
const dataSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: String,
});
const data = mongoose.model("Data", dataSchema);




// funtion to seed the database
const initializeDatabase = async () => {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const final = response.data;
    await data.deleteMany({});
    await data.insertMany(final);
};




//---------------------------------------------------------------------------------------------------1
// API to initialize the database
app.get("/seed", async (req, res) => {
  try {
    await initializeDatabase();
    res.send({
      msg: "Database Initialized",
    });
  } catch (error) {
    res.send(error)
  }
});





//---------------------------------------------------------------------------------------------------2
// API to list all the transcations
app.get("/transactions", async (req, res) => {
  try {
    const { page = 1, per_page = 10, search, month } = req.query;

    // Defining the base query for pagination
    const baseQuery = {};
    // Adding search criteria if provided
    if (search) {
      const parsedPrice = parseFloat(search);

  const textSearchConditions = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];

  // Only add price condition if parsedPrice is a valid number
  const finalConditions = parsedPrice
    ? [...textSearchConditions, { price: { $eq: parsedPrice } }]
    : textSearchConditions;

  baseQuery.$or = finalConditions;
    }
   
    // Adding month filter if provided
    if (month) {
      // Converting month name to its corresponding numerical value
      const monthNumber = new Date(month + " 1, 2000").getMonth() + 1;

      // Adding month filter to the base query
      baseQuery.$expr = {
        $eq: [
          { $month: { $dateFromString: { dateString: "$dateOfSale" } } },
          monthNumber,
        ],
      };
    }
    const transactions = await data
      .find(baseQuery)
      .limit(parseInt(per_page))
      .skip((page - 1) * per_page)
      .exec();

    res.send(transactions);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});




//---------------------------------------------------------------------------------------------------3
// API for statistics
app.get("/statistics", async (req, res) => {
  const { page = 1, per_page = 10, month } = req.query;
  const baseQuery = {};
  let totalSaleAmount = 0;
  let totalSoldItems = 0;
  let totalNotSoldItems = 0;
  // Convert month name to its corresponding numerical value
  const monthNumber = new Date(month + " 1, 2000").getMonth() + 1;
  baseQuery.$expr = {
    $eq: [
      { $month: { $dateFromString: { dateString: "$dateOfSale" } } },
      monthNumber,
    ],
  };
  const transactions = await data
    .find(baseQuery)
    .limit(parseInt(per_page))
    .skip((page - 1) * per_page)
    .exec();
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].sold) {
      totalSoldItems += 1;
      totalSaleAmount += transactions[i].price;
    } else {
      totalNotSoldItems += 1;
    }
  }
  res.json({
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems,
  });
});




//---------------------------------------------------------------------------------------------------4
//Create an API for bar chart
app.get("/bar-chart", async (req, res) => {
  const { page = 1, per_page = 10, month } = req.query;
  const baseQuery = {};

  // Convert month name to its corresponding numerical value
  const monthNumber = new Date(month + " 1, 2000").getMonth() + 1;
  baseQuery.$expr = {
    $eq: [
      { $month: { $dateFromString: { dateString: "$dateOfSale" } } },
      monthNumber,
    ],
  };
  const transactions = await data
  .find(baseQuery)
  .limit(parseInt(per_page))
  .skip((page - 1) * per_page)
  .exec();

  const priceRanges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901 },
  ];
  const barChartData = [
    {
      range: `0 - 100`,
      count: 0,
    },
    {
      range: `101 - 200`,
      count: 0,
    },
    {
      range: `201 - 300`,
      count: 0,
    },
    {
      range: `301 - 400`,
      count: 0,
    },
    {
      range: `401 - 500`,
      count: 0,
    },
    {
      range: `501 - 600`,
      count: 0,
    },
    {
      range: `601 - 700`,
      count: 0,
    },
    {
      range: `701 - 800`,
      count: 0,
    },
    {
      range: `801 - 900`,
      count: 0,
    },
    {
      range: `901 - above`,
      count: 0,
    },
  ];
  
  for (let i = 0; i < transactions.length; i++) {
    const originalPrice = transactions[i].price;
    const c = Math.floor(originalPrice / 100);
    if(c<9){
      barChartData[c].count++;
    }
    else{
      barChartData[9].count++;
    }
  }
  res.json(barChartData)
});




//---------------------------------------------------------------------------------------------------5
// API for pie chart
app.get('/pie-chart', async (req, res) => {
  const { month } = req.query;
  
  const monthNumber = new Date(month + ' 1, 2000').getMonth() + 1;
  
  try {
    // Collect all transactions from the given month
    const transactions = await data.find({
      $expr: {
        $eq: [{ $month: {$dateFromString:{dateString:'$dateOfSale'}}}, monthNumber],
      },
    });
    
    // Find unique categories and number of items from those categories
    const uniqueCategories = {};
    transactions.forEach(transaction => {
      const { category } = transaction;
      if (uniqueCategories[category]) {
        uniqueCategories[category]++;
      } else {
        uniqueCategories[category] = 1;
      }
    });
    
    const pieChartData = Object.entries(uniqueCategories).map(([category, itemCount]) => ({
      category,
      itemCount,
    }));
    
    res.json(pieChartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//---------------------------------------------------------------------------------------------------6
// API which fetches data from all three above mentioned APIs
const statisticsApiEndpoint = 'http://localhost:3000/statistics';
const barChartApiEndpoint = 'http://localhost:3000/bar-chart';
const pieChartApiEndpoint = 'http://localhost:3000/pie-chart';

app.get('/combined-api', async (req, res) => {
  try {

    const {month}=req.query;
    // Fetch data from the statistics API
    const statisticsResponse = await axios.get(`${statisticsApiEndpoint}/?month=${month}`);

    // Fetch data from the bar-chart API
    const barChartResponse = await axios.get(`${barChartApiEndpoint}/?month=${month}`);

    // Fetch data from the pie-chart API
    const pieChartResponse = await axios.get(`${pieChartApiEndpoint}/?month=${month}`);

    // Combine the responses into a final JSON
    const combinedResponse = {
      statistics: statisticsResponse.data,
      barChart: barChartResponse.data,
      pieChart: pieChartResponse.data,
    };

    res.json(combinedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.listen(3000, () => {
  console.log("Listening at port 3000");
});
