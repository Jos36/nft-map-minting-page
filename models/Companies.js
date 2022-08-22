const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    coordinates: {
      type: [Number],
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    images: {
      type: [String],
    },
    videos: {
      type: [String],
    },
    links: {
      type: [String],
    },
    isRequested: {
      type: String,
    },
    requestedName: {
      type: String,
    },
    signature: {
      type: String,
    },
    requestedDescription: {
      type: String,
    },
    requestedLogo: {
      type: String,
    },
    requestedImages: {
      type: [String],
    },
    requestedVideos: {
      type: [String],
    },
    requestedLinks: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Companies", Schema);
