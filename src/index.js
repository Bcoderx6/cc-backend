const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route for currency conversion
app.get("/convertCurrency", async (req, res) => {
  const { date, sourceCurrency, targetCurrency, amountInSourceCurrency } = req.query;

  const currencyURL = `https://openexchangerates.org/api/historical/${date}.json?app_id=${process.env.APP_ID}`;
  const namesURl = `https://openexchangerates.org/api/currencies.json?app_id=${process.env.APP_ID}`;
  try {
    const [currencyResponse, namesResponse] = await Promise.all([
      axios.get(currencyURL),
      axios.get(namesURl)
    ]);
    const currencyData = currencyResponse.data;
    const namesData = namesResponse.data;

    if (!currencyData || currencyResponse.status !== 200 || !namesData) {
      throw new Error("Unable to fetch exchange rates or currency names");
    }

    const rates = currencyData.rates;

    if (!rates.hasOwnProperty(sourceCurrency) || !rates.hasOwnProperty(targetCurrency)) {
      throw new Error("The entered sourceCurrency and targetCurrency are not available");
    }

    const sourceCurrencyName = namesData[sourceCurrency];
    const targetCurrencyName = namesData[targetCurrency];
    const sourceRate = rates[sourceCurrency];
    const targetRate = rates[targetCurrency];

    const targetValue = (targetRate / sourceRate) * parseFloat(amountInSourceCurrency);

    return res.json({
      amountInTargetCurrency: targetValue,
      sourceCurrencyName,
      targetCurrencyName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Route to get all currency names
app.get("/getAllCurrencies", async (req, res) => {
  const namesURl = `https://openexchangerates.org/api/currencies.json?app_id=${process.env.APP_ID}`;
  try {
    const response = await axios.get(namesURl);
    const namesData = response.data;

    return res.json(namesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Port setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
