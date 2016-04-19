/**
 * Composant de représentation d'un infirmier
 * @type Module nurse-template|Module nurse-template
 */
// récuperer le template et le css
var template = require('./connexionForm-template.html');
require('./connexionForm-component.css');

// utilitaires et constantes
var constants = require('../../utils/constants.js');

var ConnexionFormController = function ($mdDialog, $scope, datah,
        $mdToast, $http, $location, $window) {

    // utilitaires
    this.datah = datah;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
    this.$http = $http;
    this.$location = $location;
    this.$window = $window;

    this.errorMessage = "";

};

ConnexionFormController.$inject = ["$mdDialog", "$scope", constants.serviceDataHandler,
    "$mdToast", "$http", "$location", "$window"];

ConnexionFormController.prototype.alert = function () {
    this.$window.alert("Hello !");
};
/**
 * Le but premier était de vérifier les identifiants de manière asynchrone 
 * grace a la requete checkId mais le déclenchement traditionnel de formulaire
 * semble difficile à controler avec angular, et je ne peux pas modifier toute 
 * l'architecture du projet.
 * @returns {undefined}
 */
ConnexionFormController.prototype.validConnexionForm = function () {

    this.errorMessage = "";

    var vm = this;
    // verifier les identifiants
    this.$http.post("/checkAccess", {
        login: this.login,
        password: this.password
    })
            // les identifiants sont bons
            .then(function (response) {
                console.log(response);
                //vm.connexionForm.submit.triggerHandler('click');
            })

            // les identifiants sont mauvais
            .catch(function (response) {
                vm.errorMessage = "Identifiants invalides";
            });

};


module.exports = function (angularMod) {

    angularMod.component("connexionForm", {
        template: template,
        bindings: {
        },
        controller: ConnexionFormController
    });
};
