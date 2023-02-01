const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderSchema = new Schema({
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },
  state: {
    type: String,
    enum: [
      "active",
      "completed"
    ],
    default: "active"
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
