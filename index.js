const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gphdl2n.mongodb.net/?retryWrites=true&w=majority`;

let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  }
  return client.db('search-craft').collection('information');
}

app.get('/information', async (req, res) => {
  try {
    const collection = await connectToDatabase();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    const searchQuery = req.query.search
      ? { name: { $regex: new RegExp(req.query.search, 'i') } }
      : {};

    const filters = {
      ...searchQuery,
      ...(req.query.brand && { brand: req.query.brand }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.minPrice && { price: { $gte: parseFloat(req.query.minPrice) } }),
      ...(req.query.maxPrice && { price: { $lte: parseFloat(req.query.maxPrice) } }),
    };

    const totalDocuments = await collection.countDocuments(filters);
    const data = await collection
      .find(filters)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({
      data,
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      totalDocuments,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ error: 'An error occurred while fetching data.' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Export the app as a module for Vercel serverless function
module.exports = app;

// Listen on the port when running locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}