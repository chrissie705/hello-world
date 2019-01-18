const _ = require('lodash');

function cleanMainJson(dirtyData){
  return _.mapValues(dirtyData, (rubriqueData, rubriqueLabel) => cleanDirtyCollection(rubriqueData));
}

function cleanDirtyCollection(collection) {
  return _.map(collection, item => _.mapValues(item, (i, k, o) => (itemCleaner[k] || _.identity)(i, o)));
}

function cleanerDescriptions(dirtyValue, item){
  return dirtyValue
    .replace(item.names, '')
    .replace(item.infos, '')
    .replace('\t\n\n\t\n\n\t\n', '')
    .replace('\t\n\t\n', '')
}

// cleaner
const itemCleaner = {
  descriptions: cleanerDescriptions,
};

module.exports = {
  cleanMainJson,
}