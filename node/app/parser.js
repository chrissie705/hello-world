const fs = require('async-file');
const _ = require('lodash');

const htmlToJson = require('html-to-json');

async function getPageNumber(xml) {
  const result = await htmlToJson.parse(xml, {
    'pageNb': $doc => $doc.find('.dayNav:first-of-type .current select option'),
  });
  return result.pageNb.length;
}

async function extractArticlesToJson(xml) {
  return  await htmlToJson.parse(xml, function() {
    const name = this.map('div[itemscope] [itemprop="name"]', name => name.text());
    const urlImg = this.map('div[itemscope] [itemprop="image"]', urlImg => urlImg.attr('src'));
    const description = this.map('div[itemscope]', description => description.text());
    const info = this.map('div[itemscope] ul.detail', info => info.text());

    return {name, urlImg, description, info};
  });
}

async function getPageNumberFromFile(file){
  const data = await fs.readFile(file);
  return getPageNumber(data.toString('utf8'));
}

async function convertRubriqueXmlToAsyncObject(XmlCollection){
  return await _.reduce(XmlCollection, async (acc, rubrique, rubriqueLabel) => {
    const collection = await acc;
    const rubriqueJson = _.map(rubrique, async pages => await extractArticlesToJson(pages));
    const resolveValues = await Promise.allKeys(rubriqueJson);
    const resultValuesKeys = await _.reduce(_.values(resolveValues), async (acc, asyncValue) => {
      const collection = await acc;
      const value = await Promise.allKeys(asyncValue);
      const merged = _.reduce(value, (acc, value, index) => {
        acc[index] = acc[index] ? [...acc[index], ...value] : [...value];
        return acc;
      }, collection);
      return merged;
    }, {});
    collection[rubriqueLabel] = resultValuesKeys;
    return collection;
  }, {});
}

function mapRubriqueToObject(jsonRowObject) {
  return _.reduce(jsonRowObject, (acc, rubriqueArray, rubriqueArrayLabel) => {
    const keys = Object.keys(rubriqueArray);
    const mergeArrays = mergeArraysByKeys(keys);
    acc[rubriqueArrayLabel] = _.zipWith(..._.values(rubriqueArray), mergeArrays);
    return acc;
  }, {});
}

function mergeArraysByKeys(keys) {
  return (...values) => _.fromPairs(_.map(values, (value, index) => {
    return [keys[index], value]}));
}


async function asynccustomizer(objValue, srcValue) {
  const a = await Promise.resolve(objValue);
  const b = await Promise.resolve(srcValue);
  if (_.isArray(a)) {
    return [...a, ...b];
  }
}

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

async function convertRubriqueXmlToObject(XmlCollection){
  const rubriqueJson = await convertRubriqueXmlToAsyncObject(XmlCollection);
  return rubriqueJson;
}

module.exports = {
  getPageNumber,
  extractArticlesToJson,
  convertRubriqueXmlToObject,
  mapRubriqueToObject,
}