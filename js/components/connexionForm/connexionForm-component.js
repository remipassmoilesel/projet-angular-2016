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

var Controller = function ($mdDialog, $scope, datah, $mdToast, $http, $location) {

    // utilitaires
    this.datah = datah;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
    this.$http = $http;
    this.utils = utils;
    this.$location = $location;

    this.idControlled = false;

};

Controller.$inject = ["$mdDialog", "$scope", constants.serviceDataHandler, "$mdToast", "$http", "$location"];

/**
 * Valide le formulaire de connexion et redirige 
 * l'utilsateur vers la page à laquelle il a accès.
 * @returns {undefined}
 */
Controller.prototype.validConnexionForm = function () {

    this.errorMessage = "";
    this.idControlled = false;

    var vm = this;
    this.$http.post("/checkAccess", {
        login: this.login,
        password: this.password
    })
            // connexion autorisée
            .then(function (response) {
                vm.idControlled = true;
            })

            .catch(function (response) {
                vm.errorMessage = "Identifiants invalides";
            });

};


module.exports = function (angularMod) {

    angularMod.component("connexionForm", {
        template: template,
        bindings: {
        },
        controller: Controller
    });
};
