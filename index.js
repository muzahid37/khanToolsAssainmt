const express = require('express')
const cors=require('cors');
const { MongoClient, ServerApiVersion } =require('mongodb');
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

      app.get('/tool', async(req, res) =>{
          const query = {};
          const cursor = toolCollection.find(query);
          const tools = await cursor.toArray();
          res.send(tools);
      });
    
      // const serviceCollection = client.db("car-warehouse").collection("car-items");

      // app.get("/inventory", async (req, res) => {
      //   const query = {};
      //   const cursor = serviceCollection.find(query);
      //   const services = await cursor.toArray();
      //   res.send(services);
      // });


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