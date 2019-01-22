const _ = require('lodash');

function cleanDescription(node) {
  return Object.assign({}, node,  { description: cleanerDescriptions(node.description, node)});
}

function cleanerDescriptions(dirtyValue, item){
  return dirtyValue
    .replace(item.name, '')
    .replace(item.info, '')
    .replace('\t\n\n\t\n\n\t\n', '')
    .replace('\t\n\t\n', '')
}

// cleaner
const itemCleaner = {
  description: cleanerDescriptions,
};

const mapperPropsInfos = require('./config/propMapper.json');

// apply a mapper on each node of the collection of each category
function performMappers(json){
  return _.reduce(json, (acc, rubrique, key) => {
    return Object.assign({}, {[key]: _.map(rubrique, _.flow([
      cleanDescription,
      extractInfosFromNode(mapperPropsInfos)('info'),
      // add other mappers here
      removeprop('info'),
    ]))}, acc);
  }, {});
}

function removeprop(prop) {
  return json => {
    const { [prop]: undefined, ...otherProps} = json;
    return otherProps;
  }
}

const END_LINE_INFOS = /Programmée? dans [0-9]+.+/

function extractInfosFromNode(mapper) {
  const spreadValueInPropsMapper = spreadValueInProps(mapper)
  return propInfo => 
    node => {
      const spreadValueInPropsMapperNode = spreadValueInPropsMapper(node);
      const cleanedNode = node[propInfo].replace('\n', '').replace(END_LINE_INFOS, '');
      const explodedCollection = cleanedNode.split('\t\t');
      const cleanedExplodedCollection = explodedCollection.filter(n => n);
      const splittedPropValues = cleanedExplodedCollection.map(v => v.split(' : '));
      return Object.assign({}, spreadValueInPropsMapperNode(splittedPropValues), node);
    };
}

function spreadValueInProps(mapper){
  return node =>
    values => 
      _.reduce(values, 
      (acc, propVal) => Object.assign({[mapper[propVal[0]] || propVal[0]]: propVal[1]}, acc),
      {});
    
}

module.exports = {
  performMappers,
}