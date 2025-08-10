const express = require("express");
let cp = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const api_router = require("./api.js");

const dotenv = require("dotenv");
dotenv.config();

const {is_auth} = require("./utils.js");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

let app = express();
const PORT = process.env.PORT || 3000;

app.use(cp());
app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, "../assets")));

app.use("/user",is_auth ,express.static(path.join(__dirname, "../protected"), {
  extensions: ['html']
}));

app.use(express.static(path.join(__dirname, '../public'), {
  extensions: ['html']
}));

app.use("/api", api_router);

app.use((req, res) => {
  res.redirect("/");
});


  app.listen(PORT, ()=>{
      console.log(`Listening at PORT ${PORT}`);
  })

