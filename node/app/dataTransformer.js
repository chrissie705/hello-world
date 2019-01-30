const _ = require('lodash');
const moment = require('moment');
moment.locale('fr');
// cleaner
const itemCleaner = {
  description: cleanerDescriptions,
};

const mapperPropsInfos = require('./config/propMapper.json');

// apply a mapper on each node of the collection of each category
function performMappers(collections){
  return _.map(collections, _.flow([
      cleanDescription,
      extractInfosFromNode(mapperPropsInfos)('info'),
      // add other mappers here
      convertDurationToMinutes('duration', 'durationInMinutes'),
      convertDateFrenchToIso('dtRelease', 'dtRelease', 'DD/MM/yyyy'),
      convertDateFrenchToIso('dtStart', 'dtStart', 'D MMMM yyyy'),
      convertDateFrenchToIso('dtEnd', 'dtEnd', 'D MMMM yyyy'),
      splitData('artistes', 'artistes', ', '),
      cleanNodeProp('lieu'),
      //getSchedule(['Programmation'], 'schedules'),
      getPlaceSchedule('lieu', ['programmation'], 'schedules'),
      removeProp('info'),
    ]));
}

function cleanNodeProp(prop) {
  return node => {
    const propCleaned = (node[prop]||'').replace(/\n+|\t+/g, '');
    return Object.assign({}, node, { [prop]:  propCleaned});
  };
}

function getPlaceSchedule(placeProp, schedulesProps, propToSave){
  return node => getSchedule(schedulesProps, propToSave, node[placeProp])(node);
}

function getSchedule(schedulesProps, propToSave, place) {
  return node => {
      const schedules = _.flatMap(schedulesProps, schedule => {
        return ((node[schedule]||'').match(/[0-9]{1,2}h[0-9]{0,2}-[0-9]{1,2}h[0-9]{0,2}/g) || [])
          .map(s => {
            const ss = s.split('-');
            return {start: ss[0], end: ss[1], place};
          })
      });
      return Object.assign({}, node, {[propToSave]: schedules});
  };
}

function cleanDescription(node) {
  return Object.assign({}, node,  { description: cleanerDescriptions(node.description, node)});
}

function cleanerDescriptions(dirtyValue, item){
  return dirtyValue
    .replace(item.name, '')
    .replace(/\t\n\t\t.+/g, '')
    .replace(/\n+|\t+/g, '')
    .replace(/^   \([0-9]+ avis\)/, '')
    .replace(/(\W) - .+/, '$1');
  }

function removeProp(prop) {
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
      //const cleanedNode = node[propInfo].replace('\n', '').replace(END_LINE_INFOS, '');
      //const explodedCollection = cleanedNode.split('\t\t');
      //const cleanedExplodedCollection = explodedCollection.filter(n => n);
      const splittedPropValues = node[propInfo].map(v => v.split(' : '));
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

function convertDurationToMinutes(prop, newProp){
  return node => node[prop] ? Object.assign({}, node, {[newProp]: moment.duration(`PT${ (node[prop]||'').toUpperCase() }M`).as('minutes')}) : node;
}

function splitData(prop, newProp, separator){
  return node => node[prop] ? Object.assign({}, node, {[newProp]: node[prop].split(separator)}) : node;
}

function convertDateFrenchToIso(prop, newProp, fromFormat){
  return node => node[prop] ? Object.assign({}, node, {[newProp]: moment(node[prop], fromFormat).format('YYYY-MM-DD')}) : node;
}

function mergeArticleToPlace(jsonCollection, detailsCollection) {
  return _.map(jsonCollection, node => {
    const addresses =  _.map(node.details, details => Object.assign({}, detailsCollection[details]));
    return Object.assign({}, node, { addresses });
  });
}

function getGeoJson(object) {
  return _.mapValues(object, v => { 
    const {longitude, latitude} = v;
    return Object.assign({}, v, {loc: {type: 'Point', coordinates: [longitude, latitude]}})});
}

module.exports = {
  performMappers,
  mergeArticleToPlace,
  getGeoJson,
}