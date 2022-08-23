const express = require("express");
const router = express.Router();
const uploadFile = require("../middleware/fileUpload");
const user = require("../credentials.json");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");
const Companies = require("../models/Companies");

router.get("/save", async (req, res) => {
  const reqData = req.query.data;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);

  const finished = (err) => {
    if (err) {
      console.log(err);
      return;
    }
  };
  console.log(reqData);

  const reqArray = JSON.parse(reqData);

  fs.readFile("data.json", "utf8", function (err, dataa) {
    // Display the file content
    console.log("ArrayData", dataa);
    const arrayData = JSON.parse(dataa);
    const savedData = JSON.stringify([...arrayData, reqArray]);
    fs.writeFile("data.json", savedData, finished);

    res.status(200).json({ success: true, savedData });
  });
});

router.get("/getMinted", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);

  fs.readFile("data.json", "utf8", function (err, data) {
    // Display the file content
    console.log("data", data);

    res.status(200).json({ success: true, data });
  });
});

router.get("/getMetadata", async (req, res) => {
  const token_id = req.query.token_id;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);

  console.log("data", token_id);
  fs.readFile(`public/data/${token_id}.json`, "utf8", function (err, data) {
    // Display the file content
    console.log("data", data);

    res.status(200).json({ success: true, data });
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email == user.email) {
    const check = await bcryptjs.compare(password, user.password);
    if (check) {
      let token = jsonwebtoken.sign(email, "mysecret");
      return res.cookie("token", token).redirect("/dashboard");
    }
  }
  return res.redirect("/login?login=false");
});

router.get("/get", async (req, res) => {
  const com = await Companies.find({});
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.status(200).json({ com });
});

module.exports = router;
