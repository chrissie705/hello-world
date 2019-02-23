mongoConf = require('./config/mongoDbConf.json');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = `${mongoConf.protocol}://${mongoConf.user}:${mongoConf.password}@${mongoConf.uri}:${mongoConf.port}/${mongoConf.dbName}`;

async function connect() {
  console.log('connexion à la base mongodb');
  let client = await MongoClient.connect(url, { useNewUrlParser: true });
  let db = client.db(mongoConf.dbName);
  return { client, db };
}

function insertInCollection(collectionLabel) {
  return async (data, clean = false) => {
    const { client, db } = await connect();
    try {
      clean ? console.log(await db.collection(collectionLabel).remove({})) : null;
      const res = await db.collection(collectionLabel).insertMany(data);
      console.log(`insertion de ${res.result.n} documents`);
    }
    finally {
      client.close();
      console.log('clôture de la connection');
    }
  }
}

function getCollection(collectionLabel) {
  return async (args) => {
    const { client, db } = await connect();
    let req, res;
    try {
      req = await db.collection(collectionLabel).find({...args});
      res = await req.toArray();
    }
    finally {
      client.close();
      console.log('clôture de la connection');
      return res;
    }
  };
}

module.exports = {
  insertInCollection,
  getCollection,
}