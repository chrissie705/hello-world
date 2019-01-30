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
    //parse les infos de l'evennement
    const info = this.map('div[itemscope] ul.detail', function (info) {
     return this.map('li', detailsInfo => detailsInfo.text());
    });

    //va chercher l'url des details de l'evennement
    const details = this.map('div[itemscope] ul.detail', function (info) {
        return this.map('a[href]', urlDetails => urlDetails.attr('href'))
     });

    return {name, urlImg, description, info, details};
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
    const labels =  rubriqueArrayLabel.split('/');
    const keys = Object.keys(rubriqueArray);
    const mergeArrays = mergeArraysByKeys(keys);
    const sameLabelObjects = _.zipWith(..._.values(rubriqueArray), mergeArrays);
    const sameLabelObjectsLibelled = _.map(sameLabelObjects, o => {
      return Object.assign({}, o, { categories: labels});
    });
    return [...acc, ...sameLabelObjectsLibelled];
  },[])
}

function mergeArraysByKeys(keys) {
  return (...values) => _.fromPairs(_.map(values, (value, index) => {
    return [keys[index], value]}));
}

async function convertRubriqueXmlToObject(XmlCollection){
  const rubriqueJson = await convertRubriqueXmlToAsyncObject(XmlCollection);
  return rubriqueJson;
}

async function extractPageToJson(xmlCollection) {
  return await _.reduce(xmlCollection, async (acc, xml, index) => {
    const result = await acc;
    const asynObj = await htmlToJson.parse(xml, function() {
      //va chercher l'url des details de l'evennement
      const name = this.map('#content h1 span[itemprop="name"]', name => name.text());
      const streetAddress = this.map('#content ul.detail span[itemprop="streetAddress"]', name => name.text());
      const addressLocality = this.map('#content ul.detail span[itemprop="addressLocality"]', name => name.text());
      const latitude = this.map('#content ul.detail meta[itemprop="latitude"]', name => Number(name.attr('content')));
      const longitude = this.map('#content ul.detail meta[itemprop="longitude"]', name => Number(name.attr('content')));
      return {name, streetAddress, addressLocality, addressLocality, latitude, longitude };
    });
    const data = await Promise.allKeys(asynObj)
    const adresseInfo = _.reduce(data, (o, value, index) => {
      if(_.isArray(value) && value.length) {
        o[index] = value[0];
      }
      return o;
    },{});

    if(adresseInfo.latitude && adresseInfo.longitude) {
      result[index] = adresseInfo;
    }
    return result;
  }, {});
}

module.exports = {
  getPageNumber,
  extractArticlesToJson,
  convertRubriqueXmlToObject,
  mapRubriqueToObject,
  extractPageToJson,
}