const bc = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Buffer = require("buffer/").Buffer;

function verify(req, res, next) {
  let token = req.headers.cookie?.split("=");

  if (token && token[0] == "token" && token[1] != "null") {
    let check = jwt.verify(token[1].toString(), "mysecret");
    if (check) {
      console.log("Ok");
      return next();
    }
  }

  res.redirect("/login");
}

function verifyLand(req, res, next) {
  let token = req.headers.cookie?.split("=");

  if (token && token[0] == "token" && token[1] != "null") {
    let check = jwt.verify(token[1].toString(), "mysecret");
    if (check) {
      console.log("Ok");
      return next();
    }
  }

  res.redirect("/login");
}

function parseJWT(cookie) {
  let cookieSplited = cookie.split("=");
  let token = cookieSplited[1];
  if (cookieSplited && cookieSplited[0] == "token" && token != "null") {
    return Buffer.from(token.split(".")[1], "base64").toString();
  }
}

module.exports = {
  verify,
  parseJWT,
  verifyLand,
};
