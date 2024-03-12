import express from "express";
import cors from "cors";
import axios from "axios";
import "dotenv/config";
const app = express();
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is currently running on port ${port}`);
  });
app.get("/api", (req, res) => {
  res.send(`<h1>Hello this is Brian</h1>`);
});
app.get("/token", (req,res)=>{
    generateToken();
})
const generateToken = async(req,res,next) =>{
    const secret = process.env.MPESA_SECRET_KEY;
    const consumer = process.env.MPESA_CONSUMER_KEY;

    const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64")
    await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",{
        headers:{
            authorization:`Basic ${auth}`
        }
    }).then((response) =>{
        // console.log(response.data.access_token);
        token = response.data.access_token;
        next();
    }).catch((err)=>{
        console.log(err);
        res.status(400).json(err.message)
    })
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/stk", async (req, res) => {
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;

  res.json({ phone, amount });

  //Timestamp
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

    // Shortcode, password and passkey

    const shortcode = process.env.MPESA_PAYBILL;
    const passkey = process.env.MPESA_PASSKEY;
    const password = new Buffer.from(shortcode+passkey+timestamp).toString("base64");

  await axios
    .post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: "", //Registered short code used to receive the request
        Password: password,
        TimeStamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortcode,
        PhoneNumber: `254${phone}`,
        CallBackURL: "http://localhost:5000/callback",
        AccountReference: "Test",
        TransactionDesc: "Payment for goods or services",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((response) => {
      console.log(response);
      res.status(200).json(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    });
});
