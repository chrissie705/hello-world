const inquirer = require('inquirer');
const urlParams = require('../app/config/urlParams.json');
const _ = require('lodash');


const categories = _(urlParams.categories)
  .flatMap(cat => cat.label.split('/'))
  .uniq()
  .sortBy(s => s)
  .value();
console.log(categories)


module.exports = {
  askAdress(){

    const questions = [
      {
        name: 'address',
        type: 'input',
        message: 'Vous partez de ? ',
        validate(value){
          if (value.length) {
            return true
          } else {
            return 'veuillez saisir une adresse'
          }
        }
      },
      {
        name: 'time',
        type: 'input',
        message: 'Vous avez combien de temps devant vous (en minutes) ?',
        validate(value){

          if (Number.isInteger(Number(value))) {
            return true
          } else {
            return `veuillez saisir une durée en minutes valide`
          }
        }
      },
      {
        name: 'categories',
        type: 'checkbox',
        choices: categories,
        message: 'Vous voulez voir',
        validate(value){
          if (value.length) {
            return true
          } else {
            return 'veuillez sélectionner au moins une catégorie';
          }
        }
      },

    ];

    return inquirer.prompt(questions);
  }
};

