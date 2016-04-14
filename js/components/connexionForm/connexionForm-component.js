/**
 * Composant de représentation d'un infirmier
 * @type Module nurse-template|Module nurse-template
 */
// récuperer le template et le css
var template = require('./connexionForm-template.html');
require('./connexionForm-component.css');

// utilitaires et constantes
var utils = require('../../functionnalcore/utils.js');
var constants = require('../../functionnalcore/constants.js');

var Controller = function ($mdDialog, $scope, datah, $mdToast) {

    // utilitaires
    this.datah = datah;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
    this.utils = utils;

};

Controller.$inject = ["$mdDialog", "$scope", constants.serviceDataHandler, "$mdToast"];


module.exports = function (angularMod) {

    angularMod.component("connexionForm", {
        template: template,
        bindings: {
        },
        controller: Controller
    });
};
