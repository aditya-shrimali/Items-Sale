const express = require("express");
const mongoose = require("mongoose");
const { default: axios } = require("axios");
const app = express();

mongoose.connect(
  "mongodb+srv://shrimaliaditya013:Mongo%4013102k3@cluster0.dejhjin.mongodb.net/tododatabase?retryWrites=true&w=majority"
);

const userSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: String,
});
const user = mongoose.model("User", userSchema);

//funtion to seed the database
const initializeDatabase = async () => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const data = response.data;

    await user.deleteMany({});

    await user.insertMany(data);
  } catch (error) {
    res.send(error);
  }
};

//---------------------------------------------------------------------------------------------------1
//API to initialize the database
app.get("/", async (req, res) => {
  await initializeDatabase();
  res.send({
    msg: "Database Initialized",
  });
});

//---------------------------------------------------------------------------------------------------2
// API to list all the transcations
app.get("/transactions", async (req, res) => {
  try {
    const { page = 1, per_page = 10, search, month } = req.query;

    // Define the base query for pagination
    const baseQuery = {};
    // Add search criteria if provided
    if (search) {
      baseQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: { $eq: parseFloat(search) } },
      ];
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

    const transactions = await user
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
  const transactions = await user
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
  const transactions = await user
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
    barChartData[c].count++;
  }
  res.json(barChartData)
});






app.listen(3000, () => {
  console.log("Listening at port 3000");
});
