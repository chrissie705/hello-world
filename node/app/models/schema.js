const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');

const typeDefs = `
type Query {
  activities(position: activityPositionInput, filters: activityFiltersInput): [Activity!]!
  allActivities: [Activity!]!
}

"donne la position de la requete"
input activityPositionInput {
  latitude: Float
  longitude: Float
}

"filtres sur les activités"
input activityFiltersInput {
  "contient dans le nom"
  name: String
  "contient dans la description"
  description: String
  "contient dans l'une des category"
  categories: String
}

"une activité"
type Activity {
  name: String!
  lieu: String
  urlImg: String!
  description: String!
  "les différentes categories d'une activité"
  categories: [String!]!
  "les horaires"
  schedules: [Schedule]!
  "les adresses"
  addresses: [Address!]!
}

type Address {
  name: String!
  streetAddress: String
  addressLocality: String
  latitude: Float
  longitude: Float
}

type Schedule {
  start: String
  end: String
  place: String
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;