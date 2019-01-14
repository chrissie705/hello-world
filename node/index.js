const fetcher = require('./app/fetcher');
const fs = require('async-file');

async function getInfo(){
  const data = await fetcher.getRubrique();
  await fs.writeFile(__dirname + '/test.json', JSON.stringify(data));
}


getInfo();