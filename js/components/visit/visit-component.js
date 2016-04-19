/**
 * Composant de représentation d'une visite
 * @type Module formNewPatient-template|Module formNewPatient-template
 */

// récuperer le template et le css
var template = require('./visit-template.html');
require('./visit-component.css');

var constants = require('../../utils/constants.js');

var VisitController = function ($http, datah, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.datah = datah;
    this.$scope = $scope;

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
VisitController.$inject = ["$http", constants.serviceDataHandler, "$scope"];

module.exports = function (angularMod) {

    angularMod.component("visit", {
        template: template,
        controller: VisitController,
        bindings: {
            data: "<"
        }
    });
};
