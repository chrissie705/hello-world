const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./inquirer');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const axios = require('axios');
const qs = require('querystring');
const client = require('graphql-client')({ url: 'http://localhost:4000/graphql'});
const _ = require('lodash');
const util = require('util');

const run = async () => {
  const results = await inquirer.askAdress();
  const spinGeodecode = new Spinner(`géodecode l'adresse ...`)
  spinGeodecode.start();
  const pos = await getPosFromAddress(results.address);
  spinGeodecode.stop();
  console.log(`position de l'adresse retrouvé =>`, pos);

  const params = Object.assign({}, results, { pos });
  const spinActivitiesSearch = new Spinner('recherche des activités...');
  spinActivitiesSearch.start();
  const activities = await getResults(params);
  const groupedNotes = _(activities)
    .filter(a => a.notes.length > 10)
    .map(a => {
      const averageNotes = _.sum(a.notes)/a.notes.length;
      const nbNotes = a.notes.length;
      return _.omit(Object.assign({}, a, {averageNotes, nbNotes}), ['notes']);
    })
    .orderBy(['averageNotes'], ['desc'])
    .take(5)
    .value();

  spinActivitiesSearch.stop()
  console.log('Nous vous proposons : ')
  console.log(util.inspect(groupedNotes, {showHidden: false, depth: null, colors: true}))
}

async function getPosFromAddress(address) {
  console.log('recherche', `https://api-adresse.data.gouv.fr/search/?q=${qs.escape(address)}`)
  try {
    const res = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${qs.escape(address)}`);
    return res.data.features[0].geometry.coordinates;
  } catch(e) {
    throw Error('problème avec la connection au serveur de geodecodage')
  }
}

async function getResults({pos, time, categories}){
  const query =  `
  query($position: activityPositionInput, 
    $disponibilite: activityDisponibiliteInput
    $filters: activityFiltersInput) {
    activities(
      position: $position
      disponibilite: $disponibilite
      filters: $filters
    ){
      name
      categories
      description
      lieu
      notes
      addresses {
        streetAddress
        addressLocality
      }
    }
  }
  `;

  const variables = {
    position: {
      latitude: pos[1],
      longitude: pos[0],
    },
    disponibilite: {
      time: Number(time),
    },
    filters: {
      categories: categories.join(' '),
    }
  };

  try {
    const res = await client.query(query, variables);
    return res.data.activities;
  } catch(e) {
    throw Error(`Un problème est survenu lors de la requete vers graphql, ${e}`);
  }
}

clear();
console.log(
  chalk.yellow(
    figlet.textSync('lazytrip', {
      horizontalLayout: 'full',
    })
  )
)

run();

