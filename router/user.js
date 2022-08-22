const express = require("express");
const router = express.Router();
const Companies = require("../models/Companies");
const Users = require("../models/Users");
const uploadFile = require("../middleware/fileUpload");
const user = require("../credentials.json");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const { verify, parseJWT, verifyLand } = require("../middleware/auth");
const axios = require("axios");

router.post("/add", verify, async (req, res) => {
  try {
    console.log("Adding");
    const signature = parseJWT(req.headers.cookie);
    await uploadFile(req, res);
    const land = await Companies.find({
      coordinates: [req.body.coordinateX, req.body.coordinateY],
    });
    const data = {
      coordinates: [req.body.coordinateX, req.body.coordinateY],
      name: req.body.name,
      description: req.body.description,
      logo: `/images/${req.files.logo[0].filename}`,
      images: [],
      videos: [],
      links: req.body.links?.split(","),
      signature: signature,
      isRequested: false,
    };
    console.log(data);
    req.files.images?.forEach((img) => {
      data.images.push(`/images/${img.filename}`);
    });
    req.files.videos?.forEach((img) => {
      data.videos.push(`/images/${img.filename}`);
    });

    if (land.length === 0) {
      let company = await Companies.create(data);
      console.log(company);
      res.status(200).json({ success: "Successfully Added...", company });
    } else if (land.length === 1) {
      await Companies.updateOne(
        { coordinates: [req.body.coordinateX, req.body.coordinateY] },
        { ...data },
        { upsert: true }
      );
      res.status(200).json({ success: "Successfully changed info" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

router.post("/addUser", async (req, res) => {
  try {
    console.log("Adding User");
    await uploadFile(req, res);

    const data = {
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
      company: req.body.company,
      website: req.body.website,
      bio: req.body.bio,
      whatAreYouLookingFor: req.body.whatAreYouLookingFor?.split(","),
      whatTopicsAreYouInterestedIn: req.body.whatTopicsAreYouInterestedIn,
      location: req.body.location,
      whatKindOfServiceYouOffer: req.body.whatKindOfServiceYouOffer,
      type: req.body.type,
      wallet: req.body.wallet,
    };
    console.log(data);

    let user = await Users.create(data);
    res.status(200).json({ success: "Successfully Added User", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

router.post("/modifiyUser", async (req, res) => {
  try {
    console.log("modifying User");
    await uploadFile(req, res);

    const data = {
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
      company: req.body.company,
      website: req.body.website,
      bio: req.body.bio,
      whatAreYouLookingFor: req.body.whatAreYouLookingFor?.split(","),
      whatTopicsAreYouInterestedIn: req.body.whatTopicsAreYouInterestedIn,
      location: req.body.location,
      whatKindOfServiceYouOffer: req.body.whatKindOfServiceYouOffer,
      type: req.body.type,
      wallet: req.body.wallet,
    };
    console.log(data);

    await Users.updateOne(
      { wallet: req.body.wallet },
      { ...data },
      { upsert: true }
    );
    res.status(200).json({ success: "Successfully modified User" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

router.post("/request", async (req, res) => {
  try {
    console.log("requesting");
    await uploadFile(req, res);
    const land = await Companies.find({
      coordinates: [req.body.coordinateX, req.body.coordinateY],
    });
    const data = {
      coordinates: [req.body.coordinateX, req.body.coordinateY],
      requestedName: req.body.name,
      requestedDescription: req.body.description,
      requestedLogo: `/images/${req.files.logo[0].filename}`,
      requestedImages: [],
      requestedVideos: [],
      requestedLinks: req.body.links?.split(","),
      isRequested: true,
    };
    console.log(data);
    req.files.images?.forEach((img) => {
      data.requestedImages.push(`/images/${img.filename}`);
    });
    req.files.videos?.forEach((img) => {
      data.requestedVideos.push(`/images/${img.filename}`);
    });
    if (land.length === 0) {
      let company = await Companies.create(data);
      console.log(company);
      res.status(200).json({ success: "Successfully requested", company });
    } else if (land.length === 1) {
      await Companies.updateOne(
        { coordinates: [req.body.coordinateX, req.body.coordinateY] },
        { ...data },
        { upsert: true }
      );
      res.status(200).json({ success: "Successfully changed request info" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

router.get("/getRequests", async (req, res) => {
  const requests = await Companies.find({ isRequested: true });
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.status(200).json({ requests });
});

router.get("/get", async (req, res) => {
  const com = await Companies.find({});
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.status(200).json({ com });
});

router.get("/getUsers", async (req, res) => {
  const users = await Users.find({ type: "person" });
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.status(200).json({ users });
});

router.get("/getCompanies", async (req, res) => {
  const com = await Users.find({ type: "company" });
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.status(200).json({ com });
});

router.get("/checkUser", async (req, res) => {
  const wallet = req.query.wallet;
  const user = await Users.find({ wallet: wallet });
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.status(200).json({ user });
});

router.get("/getNFTs", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);

  const key = process.env.MORALIS_API_KEY;
  const address = req.query.address;
  console.log("address", address);
  let config = {
    method: "get",
    url: `https://deep-index.moralis.io/api/v2/${address}/nft?chain=rinkeby&format=decimal`,
    headers: { Accept: "application/json", "X-API-Key": key },
  };

  axios(config)
    .then(function (response) {
      res.status(200).json({ success: true, data: response.data });
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json({ success: false });
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

router.post("/apply", verify, async (req, res) => {
  try {
    const signature = parseJWT(req.headers.cookie);
    await uploadFile(req, res);
    const requests = await Companies.find({ _id: req.body.id });

    const {
      requestedDescription,
      requestedImages,
      requestedLinks,
      requestedLogo,
      requestedName,
      requestedVideos,
    } = requests[0];

    const data = {
      name: requestedName,
      description: requestedDescription,
      logo: requestedLogo,
      images: requestedImages,
      videos: requestedVideos,
      links: requestedLinks,
      signature: signature,
      isRequested: false,
    };

    console.log(data);

    await Companies.updateOne(
      {
        _id: req.body.id,
      },
      { ...data },
      { upsert: true }
    );

    res.status(200).json({ success: "Successfully applied" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

router.post("/reject", verify, async (req, res) => {
  try {
    const signature = parseJWT(req.headers.cookie);
    await uploadFile(req, res);

    const data = {
      requestedName: null,
      requestedDescription: null,
      requestedLogo: null,
      requestedImages: [],
      requestedVideos: [],
      requestedLinks: [""],
      signature: signature,
      isRequested: false,
    };

    console.log(data);

    await Companies.updateOne(
      {
        _id: req.body.id,
      },
      { ...data },
      { upsert: true }
    );

    res.status(200).json({ success: "Successfully rejected" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

module.exports = router;
