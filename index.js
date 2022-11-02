const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config()
const app = express();
const port = process.env.PORT || 5000;

// middle wire
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Genius car server is running !!!");
});

// connect with database(mongodb)


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.rgyxe1r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run(){
  try{
    // services collection
    const servicesCollection = client.db("geniusCar").collection("services")
    
    // orders collection
    const ordersCollection = client.db("geniusCar").collection("orders")

    // get all services
    app.get("/services", async(req, res) => {
      const cursor = servicesCollection.find({})
      const storedServices = await cursor.toArray();
      res.send(storedServices)
    })

    // get single services 
    app.get("/services/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const cursor = await servicesCollection.findOne(query)
      res.send(cursor)
    })

    // post orders
    app.post("/orders", async(req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order)
      res.send(result)
    })
  }
  finally{

  }
}
run().catch(err => console.dir)


app.listen(port, () => {
  console.log(`genius car server running on port ${port}`);
});
