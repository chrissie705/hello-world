const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const parser = require('./parser');
const params = require('./config/urlParams.json');
const departements = require('./config/departements.json');

function getRubrique(params) {
  return async departement => {
    return await _.reduce(params.categories, async (acc, category) => {
      let collection = await acc;
      const fetchRubriquePage = fetchRubrique.bind(null, params.url, _.replace(category.params, '{departement}', departement));
      console.log(`==[${category.label}]==`);
      const result = await fetchRubriquePage();

      collection[category.label] = [result.data];
      const pageNb = await parser.getPageNumber(result.data);
      // get data by pages
      if (pageNb > 0) {
        collection = await _.reduce(_.range(2, pageNb), async (acc, page) => {
          const collection = await acc;
          const cat = await fetchRubriquePage(page);
          collection[category.label] = [...collection[category.label], cat.data];
          return acc;
        }, Promise.resolve(collection));
      }
      return collection;
    }, Promise.resolve({}));
  };
}

function getRubriqueByDepartement(departement) {
  const getRubriqueByParams = getRubrique(params);
  return async () => {
      return await _.reduce(departement, async (groupedDataDepartement, departement) => {
      let collection = await groupedDataDepartement;
      console.log(`=== DEPARTEMENT ${departement} ===`);
      return _.merge(collection, await getRubriqueByParams(departement));
    }, Promise.resolve({}));
  };
}

async function fetchRubrique(url, values, npage = 1) {
  console.log(querystring.stringify({ values, npage }));
  return await axios.post(url, querystring.stringify({ values, npage }));
}

async function fetchPage(url) {
  return await axios.get(url);
}

function getDetailsByUrls (rubriqueCollections) {
  return _.uniq(_.flatMap(rubriqueCollections, node => node.details));
}

function getDetailXmlFromUrls (baseUrl){
  return async  urls =>  {
    return _.reduce(urls, async (acc, url) => {
      const results = await acc;
      if(_.startsWith(url, '/')) {
        const result = await fetchPage(`${baseUrl}${url}`);
        results[url] = result.data;
      }
      return results;
    }, {});
  }
}

module.exports = {
  getRubrique: getRubrique(params),
  getRubriqueByDepartement: getRubriqueByDepartement(departements),
  getDetailsByUrls,
  getDetailXmlFromUrls,
};