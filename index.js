const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gphdl2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const information = client.db('search-craft').collection('information');

    app.get('/api/information', async (req, res) => {
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
        res.status(500).send({ error: 'An error occurred while fetching data.' });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Only listen on a port if not running in a Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
