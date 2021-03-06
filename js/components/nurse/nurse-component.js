/**
 * Composant de représentation d'un infirmier, avec toutes informations
 * @type Module nurse-template|Module nurse-template
 */

// récuperer le template et le css
var template = require('./nurse-template.html');
require('./nurse-component.css');

// utilitaires et constantes
var constants = require('../../utils/constants.js');

var NurseController = function($mdDialog, $scope, datah, $mdToast) {

    // utilitaires
    this.datah = datah;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
    this.smallContent = "100px";
    this.largeContent = "200px";

    // les modes d'affichage de l'infirmier
    this.availablesDisplayModes = ["summary", "affectedPatients"];
    this.setDisplayMode("summary");

    var vm = this;
    datah.searchPatients({
        nurseId: this.data.id
    }).then(function(patients) {
        vm.affectedPatients = patients;
    });

};

NurseController.$inject = ["$mdDialog", "$scope", constants.serviceDataHandler, "$mdToast"];

/**
 * Modifier l'affichage du composant. Par exemple: seulement qqu informations,
 * ou le tout
 * @param {type} mode
 * @returns {undefined}
 */
NurseController.prototype.setDisplayMode = function(mode) {

    if (this.availablesDisplayModes.indexOf(mode) === -1) {
        throw constants.INVALID_ARGUMENT + ": " + mode;
    }
    this.displayMode = mode;
};

module.exports = function(angularMod) {

    angularMod.component("nurse", {
        template: template,
        bindings: {
            /**
             * Les informations de l'infirmier a afficher
             * @type {String}
             */
            data: "<",
        },
        controller: NurseController
    });
};
