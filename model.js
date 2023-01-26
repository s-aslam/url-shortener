const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const SHORTNER = 'shortner'

const schema = mongoose.Schema(
  {
    shortCode: { type: String, trim: true },
    url: { type: String, trim: true },
    accessCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: new Date() },
    lastAccessedAt: { type: Date, default: null },
  },
);


// Check if shortCode is taken
schema.statics.isShortCodeExists = async function (shortCode) {
  const instance = await this.findOne({ shortCode });
  return !!instance;
};
schema.plugin(toJSON);

const Shortner = mongoose.model(SHORTNER, schema);
module.exports = Shortner;
