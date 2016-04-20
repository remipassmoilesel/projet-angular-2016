/**
 * Afficher un objet JSON de manière lisible
 * @type Module formNewPatient-template|Module formNewPatient-template
 */

// récuperer le template et le css
var template = require('./searchForm-template.html');
require('./searchForm-component.css');

var constants = require('../../utils/constants.js');

var SearchFormController = function ($http, datah, $scope, $rootScope, $timeout) {

    // conserver les références des services
    this.$http = $http;
    this.datah = datah;
    this.$scope = $scope;
    this.$timeout = $timeout;

    var vm = this;

    // listes de tous les infirmiers pour le formulaire
    this.datah.getNurses().then(function (response) {
        vm.allNurses = response;
    })

    this.search();

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
SearchFormController.$inject = ["$http", constants.serviceDataHandler, "$scope", "$rootScope", "$timeout"];

/**
 * Recherche un patient  ou un infirmier et affiche des résultats
 * @returns {undefined}
 */
SearchFormController.prototype.search = function () {

    // enlever les précédents résultats
    this.nurseResults = [];
    this.patientResults = [];
    this.showFormMessage("");

    // vérifier les champs
    var formIsOk = false;
    var toCheck = [this.personName, this.personFirstname, this.personId];
    for (var i in toCheck) {
        var tc = toCheck[i];
        if (typeof tc !== "undefined" && tc.length > 0) {
            formIsOk = true;
        }
    }

    if (formIsOk === false) {
        this.showFormMessage("Vous devez remplir au moins un des champs.");
        return;
    }

    var wantedPatient = {
        name: this.personName,
        firstname: this.personFirstName,
        ssid: this.personId,
    };
    var wantedNurse = {
        name: this.personName,
        firstname: this.personFirstName,
        id: this.personId,
    };

    var vm = this;
    this.datah.searchPatients(wantedPatient).then(function (patients) {

        vm.datah.searchNurses(wantedNurse).then(function (nurses) {

            console.log(vm);

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

SearchFormController.prototype.getSearchUrl = function () {

    var output = "#/search";
    var params = [this.personName, this.personFirstname, this.personId];

    for (var i = 0; i < params.length; i++) {

        var p = params[i];

        if (typeof p !== "undefined" && p.length > 0) {
            output += "/" + p;
        }
        else {
            // l'espace sera ignoré dans la recherche
            output += "/ ";
        }

    }

    return output;
}

module.exports = function (angularMod) {

    angularMod.component("searchForm", {
        template: template,
        controller: SearchFormController,
        bindings: {
            personName: "@",
            personFirstname: "@",
            personId: "@"
        }
    });

};
