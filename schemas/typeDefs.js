const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Profile {
    _id: ID
    name: String
    email: String
    password: String
    orders: [Order]
  }

  type Product {
    _id: ID
    product_name: String
    price: Float
    stock: Int
    email: String
    url: String
  }

  type Order {
    _id: ID
    purchaseDate: String
    products: [Product]
  }

  type Auth {
    token: ID!
    profile: Profile
  }

  type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile
    products(name: String): [Product]
    product(_id: ID!): Product
    order(_id: ID!): Order
    orderActive: Order
    orderCompleted: Order
  }

  type Mutation {
    addProfile(name: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addOrder(products: [ID]!): Order
    removeFromOrder(orderId: ID!, productId: ID!): Order
    updateProfile(
      firstName: String
      lastName: String
      email: String
      password: String
    ): Profile
    updateProduct(_id: ID!, stock: Int!): Product
    checkout: Order
    removeProfile: Profile
  }
`;

module.exports = typeDefs;
