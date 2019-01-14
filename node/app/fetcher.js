const _ = require('lodash');
const axios = require('axios');
const FormData = require('form-data');
const querystring = require('querystring');
const parser = require('./parser');
const params = require('./urlParams.json');

function getRubrique(params) {
  return async () => {
    return await _.reduce(params.categories, async (acc, category) => {
      let collection = await acc;
      const fetchRubriquePage = fetchRubrique.bind(null, params.url, category.params);
      const result = await fetchRubriquePage();

      collection[category.label] = [result.data];
      console.log(category.label, '=====================================================================');
      console.log(result.data);
      const pageNb = await parser.getPageNumber(result.data);
      console.log(category.label, '-----------', pageNb);
      if (pageNb > 0) {
        collection = await _.reduce(_.range(2, pageNb), async (acc, page) => {
          const collection = await acc;
          const cat = await fetchRubriquePage(page);
          console.log(category.label, '-----------', page);
          collection[category.label] = [...collection[category.label], cat.data];
          return acc;
        }, Promise.resolve(collection));
      }
      return collection;
    }, Promise.resolve({}));
  }
}

async function fetchRubrique(url, values, nbpage = 1) {
  console.log(url, values, nbpage);
  return await axios.post(url, querystring.stringify({ values, nbpage }));
}

module.exports = {
  getRubrique: getRubrique(params),
};