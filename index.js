const express = require('express')
const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } =require('mongodb');
const app = express();
require('dotenv').config();
const port =process.env.PORT|| 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l2rnw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
      await client.connect();
      const toolCollection = client.db('tools-managements').collection('tools');
      const bookingCollection = client.db('tools-managements').collection('booking');

      app.get('/tool', async(req, res) =>{
          const query = {};
          const cursor = toolCollection.find(query);
          const tools = await cursor.toArray();
          res.send(tools);
      });

      app.get('/tool/:id', async (req, res) => {
        const id = req.params.id;
        // console.log(id);
        const query = {_id:ObjectId(id)};
        const purchase = await toolCollection.findOne(query);
        res.send(purchase);    
    });
   
    app.get('/booking', async(req, res) =>{
      const user=req.query.user;
        const query = {user: user};
        const bookings = await bookingCollection.find(query).toArray();
       
        res.send(bookings)
     
     
     
    })
    app.post('/booking', async(req,res)=>{
      const booking=req.body;
      const result=await bookingCollection.insertOne(booking);
      res.send(result);
    });
      


  }
  finally{

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('hellow from tools managements')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})