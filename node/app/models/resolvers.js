const dao = require('../dao');
const _ = require('lodash');
const urlParams = require('../config/urlParams');

const resolvers = {
  Query: {
    activities(parent, {position, disponibilite, filters}) {

      console.log('position', position)
      console.log('filters', filters)
      console.log('disponibilite', disponibilite);
      let newFilters = _.mapValues(filters, value => new RegExp(value));
      
      if(position) {
        const pos = { 
          'addresses.loc': { 
            $nearSphere: {
              $geometry: {
                type : 'Point',
                coordinates : [ position.longitude , position.latitude ]
              },
              $maxDistance: 20000,
            }
          }
        };
        newFilters = Object.assign({}, newFilters, pos);
      }
      return dao.getCollection('activities')({...newFilters}) || [];
    },
    allActivities() {
      return dao.getCollection('activities')();
    },
    categories() {
      return _(urlParams.categories)
        .flatMap(cat => cat.label.split('/'))
        .uniq()
        .sortBy(s => s);
    }
  },
};

module.exports = resolvers;