const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb:https://e--commerce-backend-2351df4a39a2.herokuapp.com/',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

module.exports = mongoose.connection;
