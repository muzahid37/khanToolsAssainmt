const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l2rnw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req,res,next){
  const authHeader=req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message:'UnAuthorized access'});
  }
  const token=authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
    if(err){
      return res.status(403).send({message:'Forbidden access'});
    }
    req.decoded=decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const toolCollection = client.db("tools-managements").collection("tools");
    const reviewCollection = client.db("tools-managements").collection("reviews");
    const bookingCollection = client.db("tools-managements").collection("bookings");
    const usersCollection = client.db("tools-managements").collection("users");
    const profileCollection = client.db("tools-managements").collection("profile");

    app.get("/tool", async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });
    app.post("/tool", async (req, res) => {
      const newTool = req.body;  
          const result = await toolCollection.insertOne(newTool);
          res.send(result);
     
    });

    app.get("/tool/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const purchase = await toolCollection.findOne(query);
      res.send(purchase);
    });

    
    app.get("/booking", async(req,res)=>{
      const user=req.query.user;
      const query={user:user}
      const bookings=await bookingCollection.findOne(query);
      res.send(bookings);

    })
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });
    app.post("/review", async (req, res) => {
      const booking = req.body;
      const result = await reviewCollection.insertOne(booking);
      res.send(result);
    });
    app.get('/admin/:email'),async(res,req)=>{
      const email=req.params.email;
      const user=await usersCollection.findOne({email:email});
      const isAdmin=user.role==='admin';
      res.send({admin:isAdmin});
    }
    app.put('/user/admin/:email', async (req, res) => {
      const email = req.params.email;
      const requester=req.decoded.email;
      const requesterAccount=await usersCollection.findOne({email:requester});
      if(requesterAccount.role==="admin"){
       const filter = { email: email };
       
       const updateDoc = {
         $set:{role:'admin'},
       };
      const result = await usersCollection.updateOne(filter, updateDoc);
     
      res.send(result);
      }
      else{
        res.status(403).send({message:'forbidden'})
      }

      
      
     
    });
    app.get('/user', async(req,res)=>{
      const users=await usersCollection.find().toArray();
      res.send(users);
    })
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({email: email }, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' }); 
      // res.send(result);
      
      res.send({result, token});
    })  
    app.get("/profile", async (req, res) => {
      const query = {};
      const cursor = profileCollection.find(query);
      const profileData = await cursor.toArray();
      res.send(profileData);
    });
    app.post("/profile", async (req, res) => {
      const profile = req.body;
      const result = await profileCollection.insertOne(profile);
      res.send(result);
    });  


  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hellow from tools managements");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
