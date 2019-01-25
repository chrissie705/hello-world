mongoConf = require('./config/mongoDbConf.json');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = `${mongoConf.protocol}://${mongoConf.user}:${mongoConf.password}@${mongoConf.uri}:${mongoConf.port}/${mongoConf.dbName}`;

async function insertMany(collection, clean = false) {
  console.log('connexion à la base mongodb');
  let client = await MongoClient.connect(url, { useNewUrlParser: true });
  let db = client.db(mongoConf.dbName);

  try {
    clean ? await db.collection('activities').remove(): null;
    const res = await db.collection('activities').insertMany(collection);
    console.log(`insertion de ${res.result.n} documents`);
  }
  finally {
    client.close();
    console.log('clôture de la connection');
  }
}

module.exports = {
  insertMany,
}