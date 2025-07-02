// utils/imagekit.js
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: "public_ew9VZxu3RK+TVDvivOWmkdFmhzI=",
  privateKey: "private_YDquGG6BlH7mj0AzEyAr3fru4jU=",
  urlEndpoint: "https://ik.imagekit.io/4c9nfqqet"
});

module.exports = imagekit;
