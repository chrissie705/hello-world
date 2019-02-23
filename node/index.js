const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./app/models/schema');
const resolvers = require('./app/models/resolvers');
const graphqlConf = require('./app/config/graphql')

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

server.applyMiddleware({ app, path: graphqlConf.GRAPHQL_PATH });

app.listen({ port: graphqlConf.GRAPHQL_PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:${graphqlConf.GRAPHQL_PORT}${server.graphqlPath}`)
);