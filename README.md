# Initial Git 2021 amplifyagora

https://github.com/samedan/amplifyagora
https://github.com/samedan/2110_aws_marketplace

## Getting started

> Old Tranformer Graphql version
> "transformerversion": 1,
> "useexperimentalpipelinedtransformer": false,
> Old NodeJS (< version 17)

## Initial GraphQL Schema

## schema.graphql

```graphql
type Market @model @searchable {
  id: ID!
  name: String!
  products: [Product]
    @connection(name: "MarketProducts", sortField: "createdAt")
  tags: [String]
  owner: String!
  createdAt: String
}

type Product @model @auth(rules: [{ allow: owner, identityField: "sub" }]) {
  id: ID!
  description: String!
  market: Market @connection(name: "MarketProducts")
  file: S3Object!
  price: Float!
  shipped: Boolean!
  owner: String
  createdAt: String
}

type S3Object {
  bucket: String!
  region: String!
  key: String!
}

type User
  @model(
    queries: { get: "getUser" }
    mutations: { create: "registerUser", update: "updateUser" }
    subscriptions: null
  ) {
  id: ID!
  username: String!
  email: String!
  registered: Boolean
  orders: [Order] @connection(name: "UserOrders", sortField: "createdAt")
}

type Order
  @model(
    queries: null
    mutations: { create: "createOrder" }
    subscriptions: null
  ) {
  id: ID!
  product: Product @connection
  user: User @connection(name: "UserOrders")
  shippingAddress: ShippingAddress
  createdAt: String
}

type ShippingAddress {
  city: String!
  country: String!
  address_line1: String!
  address_state: String!
  address_zip: String!
}

## getiign Auth state
https://docs.amplify.aws/lib/auth/social/q/platform/js/#deploying-to-amplify-console


> React marketplace app with AWS Amplify

## Motivation & Features

This is a clone and coding-along-repo, see [reedbarger/amplifyagora](https://github.com/reedbarger/amplifyagora).

## Tech used

**Built with**

- React
- AWS Amplify
- GraphQL

## Credits

Copyright © 2019 [Reed Barger](https://github.com/reedbarger).
```
