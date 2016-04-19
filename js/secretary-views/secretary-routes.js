/**
 * Gestion des vues et des routes du cabinet médical.
 *
 * @constructor
 */

var constants = require('../utils/constants.js');

function SecretaryRoutes() {

    // Conteneurs de vues, avec leurs urls et leurs options
    this.views = {
        displaySearch: require("./displaySearch/displaySearch-view.js"),
        displayAddPatientForm: require("./addPatient/addPatient-view.js"),
        displayNonAffectedPatients: require("./displayNonAffectedPatients/nonAffectedPatients-view.js"),
        displayAllPatients: require("./displayAllPatients/allPatients-view.js"),
        displayAllNurses: require("./displayAllNurses/allNurses-view.js"),
        displayOfficeInformations: require("./displayOfficeInformations/officeInformations-view.js")
    };

}

/**
 * Référencer toutes les routes disponibles d'un module
 * @param angularMod
 */
SecretaryRoutes.prototype.registerRoutesIn = function (angularMod) {

    // fabrique de template a partir d'un element, avec titre et contenu
    var makeViewTemplate = function (elmt) {
        return "<h1>" + elmt.label + "</h1>"
            + elmt.template;
    };

    var vm = this;

    // enregistrer les routes dans le composant
    angularMod.config(['$routeProvider', function ($routeProvider) {

        // iterer les vues diponibles pour établir les routes possibles
        for (var elmtK in vm.views) {

            var elmt = vm.views[elmtK];

            // parametres de la route
            var params = {
                template: makeViewTemplate(elmt),
                controller: elmt.controller,
                controllerAs: "$ctrl"
            };

            // injection de dépendances si necessaire
            if (typeof elmt.dependencies !== "undefined") {
                params.resolve = elmt.dependencies;
            }

            // creation de la route
            $routeProvider.when(elmt.url, params);

        }

        // route par défaut sur le premier element de la liste
        $routeProvider
            .otherwise({
                redirectTo: vm.views[Object.keys(vm.views)[0]].url,
            });
    }]);
}

/**
 * Service minimaliste de mise à disposition des routes possibles
 * @constructor
 */
var SecretaryRoutesService = function () {
    this.views = new SecretaryRoutes().views;
    this.getViews = function () {
        return this.views;
    }
}

module.exports = function (angularMod) {

    // enregistrer les routes, nécéssite une première instance du service
    var rs = new SecretaryRoutes();
    rs.registerRoutesIn(angularMod);

    // enregistrer un service d'accés aux vues
    var id = constants.serviceSecretaryRoutes;
    angularMod.service(id, SecretaryRoutesService);
    return id;
};

