const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000; // Define the port for local testing

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gphdl2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000, // 10 seconds timeout
  socketTimeoutMS: 45000,  // 45 seconds timeout
});

async function run() {
  try {
    let isConnected = false;

    for (let i = 0; i < 5; i++) {
      try {
        await client.connect();
        console.log('Connected to MongoDB');
        isConnected = true;
        break;
      } catch (error) {
        console.error('Connection failed, retrying...', error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
      }
    }

    if (!isConnected) {
      console.error('Could not connect to MongoDB after several attempts.');
      process.exit(1); // Exit the process if unable to connect after retries
    }

    const information = client.db('search-craft').collection('information');

    app.get('/information', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortField = req.query.sort || 'createdAt';
        const sortOrder = req.query.order === 'desc' ? -1 : 1;

        const sortCriteria = {
          [sortField]: sortOrder
        };

        const searchQuery = req.query.search ? {
          name: { $regex: new RegExp(req.query.search, 'i') }
        } : {};

        const filters = {
          ...searchQuery,
          ...(req.query.brand && { brand: req.query.brand }),
          ...(req.query.category && { category: req.query.category }),
          ...(req.query.minPrice && { price: { $gte: parseFloat(req.query.minPrice) } }),
          ...(req.query.maxPrice && { price: { $lte: parseFloat(req.query.maxPrice) } })
        };

        const totalDocuments = await information.countDocuments(filters);
        const data = await information.find(filters)
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send({
          data,
          currentPage: page,
          totalPages: Math.ceil(totalDocuments / limit),
          totalDocuments
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send({ error: 'An error occurred while fetching data.' });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    process.on('SIGINT', async () => {
      console.log('Closing MongoDB connection due to process termination');
      await client.close();
      process.exit(0);
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

run().catch(console.dir);

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