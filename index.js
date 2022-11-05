const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
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

// JWT verification
// function verifyJWT (req, res, next){
//   const authHeader = req.headers?.authorization;
//   if(!authHeader){
//     return res.status(401).send({message: "unauthorized access hello."})
//   }
//   const token = authHeader.split(" ")[1]
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
//     if(err){
//      return  res.status(403).send({message: "forbidden access hi."})
//     }
//     req.decoded = decoded
//     next()
//   })
// }

// jwt verification
function verifyJWT(req, res, next){
  // console.log(req.headers.authorization);
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: "unauthorized access."})
  }
  const token = authHeader.split(" ")[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({message: "forbidden access"})
    }
    req.decoded = decoded;
    next()
  })
}


async function run() {
  try {
    // services collection
    const servicesCollection = client.db("geniusCar").collection("services");

    // orders collection
    const ordersCollection = client.db("geniusCar").collection("orders");

    // get all services
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const storedServices = await cursor.toArray();
      res.send(storedServices);
    });

    // get single services
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await servicesCollection.findOne(query);
      res.send(cursor);
    });

    //get order by user email
    app.get("/orders", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
        res.status(401).send({message: "unauthorized access"})
      }
      const query = {email: req.query.email}
      const cursor = ordersCollection.find(query)
      const storedOrders = await cursor.toArray()
      res.send(storedOrders)
      // const decoded = req.decoded;
      // if(decoded?.email !== req.query.email){
      //    res.status(403).send({message: "unauthorized access"})
      // }
      // let query = {};
      // if (req.query.email) {
      //   query = { email: req.query.email };
      // }
      // const cursor = ordersCollection.find(query);
      // const storedOrders = await cursor.toArray();
      // res.send(storedOrders);
    });

    //user authorization
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1 days"})
      res.send({token})
    });

    // post orders
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });
    // update orders status
    app.patch("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const updateOrder = {
        $set: {
          status: status,
        },
      };
      const result = await ordersCollection.updateOne(query, updateOrder);
      res.send(result);
    });

    // delete order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.dir);

app.listen(port, () => {
  console.log(`genius car server running on port ${port}`);
});
