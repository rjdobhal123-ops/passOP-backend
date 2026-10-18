const express = require('express');
const {MongoClient}=require('mongodb')
const cors=require("cors")
const dotenv=require("dotenv");
const bodyparser=require('body-parser')


dotenv.config()


//Connecting to the mongodb client
const url=process.env.MONGO_URI
const client=new MongoClient(url);
client.connect()
.then(()=>{console.log("Mongodb connected")})
.catch(err=>{console.log("Mongodb not connected", err)});


//App and Database
const dbname=process.env.DB_NAME
const app = express();

//Middleware
app.use(cors({
    origin: "https://pass-op-frontend-red.vercel.app/"
}));
app.use(bodyparser.json());



//Get all the passwords
app.get('/', async (req, res) => {
  
    const db=client.db(dbname);
    const collection=db.collection('passwords');
    const findResult=await collection.find({}).toArray(); 
    res.json(findResult);
  
});


//Save a password
app.post("/", async (req, res)=>{
    
        const newPassword=req.body;
        const db=client.db(dbname);
        const collection=db.collection('passwords');
        const insertPassowrd=await collection.insertOne(newPassword);
        res.send({success: true, result: insertPassowrd})
    
});



//Delete a password by id
app.delete('/', async (req, res) => {
    const {id} = req.body
    const db = client.db(dbname);
    const collection = db.collection('passwords');
    const deletePassword = await collection.deleteOne({id: id});
    res.send({success: true, result: deletePassword})
});


// Export the Express app for Vercel
export default app;