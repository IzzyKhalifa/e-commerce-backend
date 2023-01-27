const { gql } = require('apollo-server-express');

const typeDefs = gql`

  type Profile {
    _id: ID
    name: String
    email: String
    password: String
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

  type Checkout {
    session: ID
  }

  type Auth {
    token: ID!
    profile: Profile
  }

  type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    # Because we have the context functionality in place to check a JWT and decode its data, we can use a query that will always find and return the logged in user's data
    me: Profile
    products(name: String): [Product]
    product(_id: ID!): Product
    order(_id: ID!): Order
    checkout(products: [ID]!): Checkout
  }

  type Mutation {
    addProfile(name: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addOrder(products: [ID]!): Order
    updateProfile(firstName: String, lastName: String, email: String, password: String): Profile
    updateProduct(_id: ID!, stock: Int!): Product

    removeProfile: Profile
  }
`;

module.exports = typeDefs;