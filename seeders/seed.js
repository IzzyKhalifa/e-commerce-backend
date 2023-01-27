const db = require('../config/connection');
const { Profile } = require('../models');
const {Product} = require("../models");
const profileSeeds = require('./profileSeeds.json');
const productSeeds = require('./productSeeds.json');


db.once('open', async () => {
  try {
    await Profile.deleteMany({});
    await Profile.create(profileSeeds);

    await Product.deleteMany({});
    await Product.create(productSeeds);

    console.log('all done!');
    process.exit(0);
  } catch (err) {
    throw err;
  }
});
