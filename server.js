require("dotenv").config();
const express = require("express");
const router = require("./routes/router.js");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use("/", router);
app.set("port", process.env.PORT || 8080);
app.listen(app.get("port"), () => {
  console.log(`Listening to port ${process.env.PORT || 8080}`);
});
