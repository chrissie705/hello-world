const fs = require('async-file');

const htmlToJson = require('html-to-json');

async function getPageNumber(xml) {
  result = await htmlToJson.parse(xml, {
    'pageNb': $doc => $doc.find('.dayNav:first-of-type .current select option'),
  });
  return result.pageNb.length;
}

async function getPageNumberFromFile(file){
  const data = await fs.readFile(file);
  return getPageNumber(data.toString('utf8'));
}

module.exports = {
  getPageNumber,
}