/**
 * Gestion des vues et des routes du cabinet médical.
 *
 * Les routes et les controlleurs sont déclarés dynamiquement.
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
SecretaryRoutes.prototype.registerRoutesIn = function(angularMod) {

    // fabrique de template a partir d'un element, avec titre et contenu
    var makeViewTemplate = function(elmt) {
        return "<h1>" + elmt.label + "</h1>" + elmt.template;
    };

    // creer un nom de controlleur dynamique
    var controllerNameOf = function(elmt) {
        return "ViewControllerOf_" + (elmt.urlSimpleAccess.replace(/[^\w\s]/gi, ''));
    }

    var vm = this;

    // déclarer dynamiquement les controlleurs
    for (var elmtK in vm.views) {
        var elmt = vm.views[elmtK];

        // declarer le controlleur, au nom de l'url simple
        if (typeof elmt.controller !== "undefined") {
            angularMod.controller(controllerNameOf(elmt),
                elmt.controller);
        }
    }


    // declarer dynamiquement les routes
    angularMod.config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {

            // enlever les # des URLS
            $locationProvider.html5Mode(true);

            // iterer les vues diponibles pour établir les routes possibles
            for (var elmtK in vm.views) {
                var elmt = vm.views[elmtK];

                // verifier les patterns de routes
                if (elmt.urlPatterns instanceof Array !== true) {
                    throw constants.INVALID_ARGUMENT;
                }

                // iterer les differentes routes possibe pour les déclarer
                for (var r in elmt.urlPatterns) {

                    var route = elmt.urlPatterns[r];

                    // parametres de la route
                    var params = {};
                    params.template = makeViewTemplate(elmt);

                    if (typeof elmt.controller !== "undefined") {
                        params.controllerAs = "$ctrl";
                        params.controller = controllerNameOf(elmt);
                    }

                    // creation de la route
                    $routeProvider.when(route, params);

                }

            }

            // route par défaut sur le premier element de la liste
            $routeProvider
                .otherwise({
                    redirectTo: vm.views[Object.keys(vm.views)[0]].urlSimpleAccess,
                });
        }
    ]);
}

/**
 * Service minimaliste de mise à disposition des routes possibles
 * @constructor
 */
var SecretaryRoutesService = function() {
    this.views = new SecretaryRoutes().views;
    this.getViews = function() {
        return this.views;
    }
}

module.exports = function(angularMod) {

    // enregistrer les routes, nécéssite une première instance du service
    var rs = new SecretaryRoutes();
    rs.registerRoutesIn(angularMod);

    // enregistrer un service d'accés aux vues
    var id = constants.serviceSecretaryRoutes;
    angularMod.service(id, SecretaryRoutesService);
    return id;
};
