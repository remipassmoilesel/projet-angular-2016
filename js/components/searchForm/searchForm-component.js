/**
 * Afficher un objet JSON de manière lisible
 * @type Module formNewPatient-template|Module formNewPatient-template
 */

// récuperer le template et le css
var template = require('./searchForm-template.html');
require('./searchForm-component.css');

var constants = require('../../utils/constants.js');

var SearchFormController = function ($http, datah, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.datah = datah;
    this.$scope = $scope;

    // les informations a rechercher 
    this.person = {
        name: "",
        firstname: ""
    };

    // listes de tous les infirmiers pour le formulaire
    this.allNurses = this.datah.getNurses();

    // les résultats de recherche
    this.results = [];


};
// injection de dépendance sous forme d'un tableau de chaine de caractères
SearchFormController.$inject = ["$http", constants.serviceDataHandler, "$scope"];

/**
 * Recherche un patient  ou un infirmier et affiche des résultats
 * @returns {undefined}
 */
SearchFormController.prototype.search = function () {

    // enlever les précédents résultats
    this.nurseResults = [];
    this.patientResults = [];
    this.showFormMessage("");

    // vérifier le format des champs
    if (this.person.name.length < 1 &&
            this.person.firstname.length < 1) {
        this.showFormMessage("Vous devez remplir au moins un des champs.");
        return;
    }

    var vm = this;
    this.datah.searchPatients(this.person).then(function (patients) {

        vm.datah.searchNurses(vm.person).then(function (nurses) {

            if (nurses.length > 0) {
                vm.nurseResults = nurses;
            }
            if (patients.length > 0) {
                vm.patientResults = patients;
            }

            // pas de résultats
            else {
                vm.showFormMessage("Aucun résultat ne correspond à vos critères.", 5000);
            }
        });

    });



};

/**
 * Affiche un message dans le formulaire pour une durée déterminée en ms (temps optionnel)
 * @param {type} msg
 * @param {type} timeDisplayMs
 * @returns {undefined}
 */
SearchFormController.prototype.showFormMessage = function (msg, timeDisplayMs) {

    // afficher le message
    this.controllerMessageSpace = msg;

    // si le temps est déterminé l'effacer
    if (typeof timeDisplayMs !== "undefined") {

        var vm = this;
        setTimeout(function () {
            vm.controllerMessageSpace = " ";
            vm.$scope.$apply();
        }, timeDisplayMs);
    }

};

module.exports = function (angularMod) {

    angularMod.component("searchForm", {
        template: template,
        controller: SearchFormController,
        bindings: {
        }
    });
};
