const fetcher = require('./app/fetcher');
const parser = require('./app/parser');
const dataCleaner =require('./app/dataCleaner');
const fs = require('async-file');
const _ = require('lodash');
const utils = require('./app/utils');

async function getInfo(){
  const xmlCollection = await fetcher.getRubriqueByDepartement();
  let  jsonCollection;
  try {
    jsonCollection = await utils.flowAsync([
      parser.convertRubriqueXmlToObject,
      parser.mapRubriqueToObject,
      dataCleaner.cleanMainJson,
    ])(xmlCollection);
  } catch(e) {
    console.error(e);
  };

  await fs.writeFile(`${__dirname}/test.json`, JSON.stringify(jsonCollection));
}


getInfo();