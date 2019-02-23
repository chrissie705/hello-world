const { gql } = require('apollo-server-express');

const typeDefs = gql`

type Query {
    "récupere toutes les activités selon la position"
    activities(position: activityPositionInput, disponibilite: activityDisponibiliteInput, filters: activityFiltersInput): [Activity!]!
    "récupere toutes les activités"
    allActivities: [Activity!]!
    "récupere toutes les activités existante"
    categories: [String!]!
  }

"donne la position de la requete"
  input activityPositionInput {

    latitude: Float

    longitude: Float
  }

  input activityDisponibiliteInput {

    "temps en minutes de disponible"
    time: Int
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

    "nom de l'activité"
    name: String!

    "nom du lieu de l'activité"
    lieu: String

    "url de l'image de l'activité"
    urlImg: String!

    "description de l'activité"
    description: String!

    "les différentes categories d'une activité"
    categories: [String!]!

    "les horaires"
    schedules: [Schedule]!

    "les adresses"
    addresses: [Address!]!

    "temps de parcours en transport"
    timeToTravel: Int
  }

  type Address {

    "nom du lieu de l'activité"
    name: String!

    "nom de la rue de l'activité"
    streetAddress: String

    "ville/arrondissement de l'activité"
    addressLocality: String

    latitude: Float

    longitude: Float
  }

  type Schedule {

    "heure de debut"
    start: String

    "heure de fin"
    end: String
    place: String
  }
`;

module.exports = typeDefs;