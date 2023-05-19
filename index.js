const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())

// console.log(process.env.DB_USER, process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h2fzsvj.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toyCollection = client.db("toyDB").collection("toys")
    const categoryCollection = client.db("toyDB").collection("categoryToys");

    app.get('/toys-by-category', async(req, res) => {
      const category = req.query.category;
      if(category === 'All'){
        const result = await categoryCollection.find({}).toArray()
        return res.send(result)
      }
      const filter = {sub_category: category}
      const result = await categoryCollection.find(filter).toArray()
      res.send(result)
      // console.log(category)
    })

    app.post('/toys/add-toy', async(req, res) => {
      const toy = req.body;
      // console.log(doc)
      const result = await toyCollection.insertOne(toy)
      res.send(result)
    })

    app.patch('/toys/update-toy/:id', async(req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = {_id: new ObjectId(id)}
      
      const updatedToy = {
        $set: {
          ...toy
        }
      }
      const result = await toyCollection.updateOne(filter,updatedToy)
      res.send(result)
    })

    app.get('/motive-toy', (req, res) => {
      res.send('Welcome to the Motive Toy website!!')
    })

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
    res.send('Motive Toy Server is running!')
})

app.listen(port, () => {
    console.log(`Motive server is listening to port: ${port}`)
})