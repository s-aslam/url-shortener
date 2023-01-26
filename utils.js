const randomstring = require("randomstring");

const generateRandomString = async (length = 6) => {
  return randomstring.generate(length);
}

const validateURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  generateRandomString,
  validateURL
}