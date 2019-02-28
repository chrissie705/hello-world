const fetcher = require('./app/fetcher');
const parser = require('./app/parser');
const dataTransformer =require('./app/dataTransformer');
const fs = require('async-file');
const _ = require('lodash');
const utils = require('./app/utils');
const dao = require('./app/dao');
const config = require('./app/config/urlParams');

async function getInfo(){
  const xmlCollection = await fetcher.getRubriqueByDepartement();
  let  jsonCollection, detailsCollection, mergedArticleToPlace;
  try {
    jsonCollection = await utils.flowAsync([
      parser.convertRubriqueXmlToObject,
      parser.mapRubriqueToObject,
      dataTransformer.performMappers,
      dataTransformer.addNotes,
    ])(xmlCollection);

    detailsCollection = await utils.flowAsync([
      fetcher.getDetailsByUrls,
      fetcher.getDetailXmlFromUrls(config.baseUrl),
      parser.extractPageToJson,
      dataTransformer.getGeoJson,
    ])(jsonCollection);

    mergedArticleToPlace = dataTransformer.mergeArticleToPlace(jsonCollection, detailsCollection);

    console.log(mergedArticleToPlace);
  } catch(e) {
    console.error(e);
  };

  await dao.insertInCollection('activities')(mergedArticleToPlace, true);
  //await fs.writeFile(`${__dirname}/test.json`, JSON.stringify(mergedArticleToPlace));
}


getInfo();