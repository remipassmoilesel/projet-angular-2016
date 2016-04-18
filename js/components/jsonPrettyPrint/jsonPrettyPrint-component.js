/**
 * Afficher un objet JSON de manière lisible. Supporte les références circulaires.
 *
 * @type Module formNewPatient-template|Module formNewPatient-template
 */

// récuperer le template et le css
var template = require('./jsonPrettyPrint-template.html');
require('./jsonPrettyPrint-component.css');

// utilitaires et constantes
var utils = require('../../utils/utils');
var constants = require('../../utils/constants.js');

var circular = require('circular-json');

var JsonPrettyPrintController = function ($http, datah, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.datah = datah;
    this.utils = utils;
    this.$scope = $scope;

    this.prettyString = circular.stringify(this.show, null, 1);

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
JsonPrettyPrintController.$inject = ["$http", constants.serviceDataHandler, "$scope"];

module.exports = function (angularMod) {

    //var datahandler = require("../../utils/datahandler-service.js")(angularMod);

    angularMod.component("jsonPrettyPrint", {
        template: template,
        controller: JsonPrettyPrintController,
        bindings: {
            show: "<"
        }
    });
};
