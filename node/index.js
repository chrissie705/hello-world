const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');
const schema = require('./app/models/schema');
const resolvers = require('./app/models/resolvers');
const graphqlConf = require('./app/config/graphql')

const server = new ApolloServer({ schema, resolvers });

const app = express();

server.applyMiddleware({ app, path: graphqlConf.GRAPHQL_PATH });

app.listen({ port: graphqlConf.GRAPHQL_PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:${graphqlConf.GRAPHQL_PORT}${server.graphqlPath}`)
);