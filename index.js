const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const servicesCollection = client.db("geniusCar").collection("services")
    app.get("/services", async(req, res) => {
      const cursor = servicesCollection.find({})
      const storedServices = await cursor.toArray();
      res.send(storedServices)
    })

  }
  finally{

  }
}
run().catch(err => console.dir)


app.listen(port, () => {
  console.log(`genius car server running on port ${port}`);
});
