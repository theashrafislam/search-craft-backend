const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gphdl2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const information = client.db('search-craft').collection('information');

    app.get('/information', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not specified
        const skip = (page - 1) * limit;
    
        const sortField = req.query.sort || 'createdAt'; // Default sorting field
        const sortOrder = req.query.order === 'desc' ? -1 : 1; // Default to ascending order
    
        const searchQuery = req.query.search ? {
          name: { $regex: new RegExp(req.query.search, 'i') } // Case-insensitive search
        } : {};

        // Apply additional filters
        const filters = {
          ...searchQuery,
          ...(req.query.brand && { brand: req.query.brand }),
          ...(req.query.category && { category: req.query.category }),
          ...(req.query.minPrice && { price: { $gte: parseFloat(req.query.minPrice) } }),
          ...(req.query.maxPrice && { price: { $lte: parseFloat(req.query.maxPrice) } })
        };
    
        const totalDocuments = await information.countDocuments(filters); // Total documents in the collection
        const data = await information.find(filters)
          .sort({ [sortField]: sortOrder }) // Apply sorting
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});