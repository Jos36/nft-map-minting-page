const express = require("express");
const cors = require("cors");
const app = express();
const route = require("./router/index");
const userRoute = require("./router/user");
require("dotenv").config();
require("./db.js");

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
// app.use(map)

app.use("/", route);
app.use("/api", userRoute);

app.listen(process.env.PORT, () => {
  console.log("server running", process.env.PORT);
});
