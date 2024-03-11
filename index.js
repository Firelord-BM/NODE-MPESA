import express from "express"
import cors from "cors"
import 'dotenv/config'
const app = express()
const port = process.env.PORT;

app.get("/api",(req,res)=>{
    res.send (`<h1>Hello this is Brian</h1>`)
})

app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use(cors());

app.post("/stk", (req,res)=>{
   const phone = req.body.phone;
   const amount = req.body.amount;

   res.json({phone,amount});
})
app.listen(port,()=>{
    console.log(`Server is currently running on port ${port}`)
})