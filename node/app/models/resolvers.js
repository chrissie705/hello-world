const dao = require('../dao');
const _ = require('lodash');

const resolvers = {
  Query: {
    activities(parent, {position, filters}) {

      console.log('position', position)
      console.log('filters', filters)
      // return dao.getCollection('activities')({position, filters});
      const newFilters = _.mapValues(filters, value => new RegExp(value));
      return dao.getCollection('activities')({...newFilters});
    },
    allActivities() {
      return dao.getCollection('activities')();
    },
  },
};

module.exports = resolvers;