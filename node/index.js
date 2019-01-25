const fetcher = require('./app/fetcher');
const parser = require('./app/parser');
const dataTransformer =require('./app/dataTransformer');
const fs = require('async-file');
const _ = require('lodash');
const utils = require('./app/utils');
const dao = require('./app/dao');

async function getInfo(){
  const xmlCollection = await fetcher.getRubriqueByDepartement();
  let  jsonCollection;
  try {
    jsonCollection = await utils.flowAsync([
      parser.convertRubriqueXmlToObject,
      parser.mapRubriqueToObject,
      dataTransformer.performMappers,
    ])(xmlCollection);
  } catch(e) {
    console.error(e);
  };

  console.log(await dao.insertMany(jsonCollection, true));
  // await fs.writeFile(`${__dirname}/test.json`, JSON.stringify(jsonCollection));
}


getInfo();