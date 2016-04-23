/**
 * Composant de représentation d'une visite
 * @type Module formNewPatient-template|Module formNewPatient-template
 */

// récuperer le template et le css
var template = require('./visit-template.html');
require('./visit-component.css');

var constants = require('../../utils/constants.js');

var VisitController = function($http, datah, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.datah = datah;
    this.$scope = $scope;

    var vm = this;

    // recherher les informations sur l'infirmière
    datah.searchNurses({
        id: vm.data.idNurse
    }).then(function(response) {
        vm.nurse = response;
        vm.nurseName = response[0].name + " " + response[0].firstname;
    });

    datah.getActions().then(function(response) {
        vm.actionDescriptions = response;
    });

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
VisitController.$inject = ["$http", constants.serviceDataHandler, "$scope"];

module.exports = function(angularMod) {

    angularMod.component("visit", {
        template: template,
        controller: VisitController,
        bindings: {
            /**
             * Les données de la visite
             * @type {String}
             */
            data: "<",
        }
    });
};
