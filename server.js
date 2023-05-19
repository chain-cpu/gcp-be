import { config } from "dotenv";
config();

import express from "express";
import routes from "./routes/index.js";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", routes);
app.set("port", process.env.PORT || 80);
app.listen(app.get("port"), () => {
  console.log(`Listening to port ${app.get("port")}`);
});
