const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Shortner = require("./model");

const { generateRandomString, validateURL } = require("./utils");

const app = express();

const PORT = process.env.PORT || 3333;
const DB_DIALECT = process.env.DB_DIALECT || "mongodb";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "27017";
const DB_NAME = process.env.DB_NAME || "short_url_db";

// DATABASE Connection
const db_url = `${DB_DIALECT}://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

mongoose.connect(db_url, { useNewUrlParser: true });
mongoose.connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("static"));

app.set("port", PORT);
app.listen(PORT);


app.post('/api/submit', async (req, res) => {
  const data = req.body;
  const { url, shortcode: shortCode } = data;
  if (!url) {
    return res.status(400).send({ error: "URL required" });
  }
  if (!validateURL(url)) {
    return res.status(400).send({ error: "Invalid URL" });
  }
  if (shortCode) {
    if (shortCode.length !== 4) {
      return res.status(400).send({ error: "ShortCode must be at least 4 characters long" });
    }
    if (await Shortner.isShortCodeExists(shortCode)) {
      return res.status(400).send({ error: "ShortCode already exists" });
    }
  }
  data.shortCode = shortCode || await generateRandomString();
  data.lastAccessedAt = new Date();
  const instance = await Shortner.create(data);
  return res.status(200).send({ data: instance.shortCode });
});

app.get('/api/:shortcode', async (req, res) => {
  const { shortcode: shortCode } = req.params;
  const instance = await Shortner.findOne({ shortCode })
  if (!instance) {
    return res.status(404).send({ error: "Invalid shortcode" });
  }
  instance.lastAccessedAt = new Date();
  instance.accessCount += 1;
  await instance.save()
  res.redirect(instance.url);
});

app.get('/api/:shortcode/stats', async (req, res) => {
  const { shortcode: shortCode } = req.params;
  const instance = await Shortner.findOne({ shortCode })
  if (!instance) {
    return res.status(404).send({ error: "Invalid shortcode" });
  }
  return res.status(200).send({ data: instance });
});

app.use("/", function (req, res) {
  return res.status(200).send({ message: "Welcome to Short URL Generator" });
});