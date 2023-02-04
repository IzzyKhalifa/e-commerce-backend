const { AuthenticationError } = require("apollo-server-express");
const { printSourceLocation } = require("graphql");
const { Profile, Product, Order } = require("../models");
const { signToken } = require("../utils/auth");
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

const resolvers = {
  Query: {
    profiles: async () => {
      return Profile.find();
    },

    profile: async (parent, { profileId }) => {
      return Profile.findOne({ _id: profileId });
    },
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (parent, args, context) => {
      if (context.user) {
        return Profile.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    products: async () => {
      return Product.find();
    },
    product: async (parent, { _id }) => {
      return await Product.findById(_id).populate("products");
    },
    order: async (parent, { _id }, context) => {
      if (context.user) {
        const user = await Profile.findById(context.user._id).populate({
          path: "orders.products",
          populate: "products",
        });

        return user.orders.id(_id);
      }

      throw new AuthenticationError("Not logged in");
    },
    orderActive: async (parent, _args, context) => {
      if (context.user) {
        let orderActive = await Order.findOne({
          profileId: context.user._id,
          state: "active",
        }).populate("products");

        
        if (!orderActive) {
          orderActive = await Order.create({ profileId: context.user._id });
        }

        return orderActive;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    orderCompleted: async (parent, _args, context) => {
      if(context.user){
        let orderCompleted = await Order.findOne({
          profileId: context.user._id,
          state: "completed",
        }).populate("products");

        return orderCompleted;
      }
    }
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const profile = await Profile.findOne({ email });

      if (!profile) {
        throw new AuthenticationError("No profile with this email found!");
      }

      const correctPw = await profile.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(profile);
      return { token, profile };
    },
    addProfile: async (parent, { name, email, password }) => {
      const profile = await Profile.create({ name, email, password });
      const token = signToken(profile);

      return { token, profile };
    },
    updateProfile: async (parent, args, context) => {
      if (context.user) {
        return await Profile.findByIdAndUpdate(context.user._id, args, {
          new: true,
        });
      }

      throw new AuthenticationError("Not logged in");
    },
    // Set up mutation so a logged in user can only remove their profile and no one else's
    removeProfile: async (parent, args, context) => {
      if (context.user) {
        return Profile.findOneAndDelete({ _id: context.user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    addOrder: async (parent, { products }, context) => {
      if (context.user) {
        let ps = [];
        for (const id of products) {
          const product = await Product.findById(id);
          if (!product._id) {
            console.log("null");
          }
          ps.push(product);
        }
        const activeOrder = await Order.findOne({
          profileId: context.user._id,
          state: "active",
        });
        if (activeOrder) {
          const order = await Order.findOne({ _id: activeOrder._id });
          await Order.findOneAndUpdate(
            { _id: activeOrder._id },
            { products: [...ps, ...order.products] }
          );
          const updatedOrder = await Order.findOne({
            _id: activeOrder._id,
          }).populate("products");
          
          return updatedOrder;
        }

        const order = new Order({ profileId: context.user._id, products: ps });
        const newOrder = await Order.create(order);
        const updatedOrder = await Order.findOne({ _id: newOrder._id }).populate(
          "products"
        );
        return updatedOrder;
      }

      throw new AuthenticationError("Not logged in");
    },
    removeFromOrder: async (parent, { orderId, productId }) => {
      let order = await Order.findOne({ _id: orderId });

      let updatedProductIds = order.products;
      let index = -1;
      for (let i = 0; i < updatedProductIds.length; i++) {
        if (updatedProductIds[i] == productId) {
          index = i;
          break;
        }
      }

      if (index > -1) {
        updatedProductIds.splice(index, 1);
      }

      await Order.findOneAndUpdate(
        { _id: order._id },
        { products: updatedProductIds }
      );
      const updatedOrder = await Order.findOne({ _id: order._id }).populate(
        "products"
      );

      return updatedOrder;
    },
    updateProduct: async (parent, { _id, quantity }) => {
      const decrement = Math.abs(quantity) * -1;

      return await Product.findByIdAndUpdate(
        _id,
        { $inc: { quantity: decrement } },
        { new: true }
      );
    },
    checkout: async (parent, args, context) => {
      console.log(context.user._id)
      const order = await Order.findOneAndUpdate({
        profileId: context.user._id,
        state: "active",
      }, {state: "completed"});
     
      const updatedOrder = await Order.findOne({ _id: order._id }).populate(
        "products"
      )

      return updatedOrder
    },
  },
};

module.exports = resolvers;
