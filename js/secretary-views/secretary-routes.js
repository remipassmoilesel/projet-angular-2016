/**
 * Gestion des vues et des routes du cabinet médical.
 *
 *
 *
 *
 * @constructor
 */

var constants = require('../utils/constants.js');

function SecretaryRoutes() {

    // Conteneur de vues, avec leurs urls et leurs options
    this.views = {};

    // A conserver pour exemple complet
    //
    // this.views.displaySearch = {
    //     label: "Rechercher",
    //     urlPattern: "/search/:name/:fistname",
    //     url: "/search",
    //     template: require("./search-view.html"),
    //     controller: function ($location) {
    //         console.log(this);
    //         console.log($location);
    //         console.log(vm);
    //     },
    //     dependencies: {
    //         $location: "$location"
    //     }
    // };

    this.views.displaySearch = {
        label: "Rechercher",
        urlPattern: "/search",
        url: "/search",
        template: require("./search-template.html"),
        controller: function () {
            console.log(this);
        }
    };

    this.views.displayAddPatientForm = {
        label: "Ajouter un patient",
        urlPattern: "/addPatient",
        url: "/addPatient",
        template: require("./addPatient-template.html"),
        controller: function (datah, utils, toasts) {

            var vm = this;
            utils.newDistantRepetedRequest(
                vm,
                toasts,
                function () {
                    return datah.getNurses();
                },
                function (response) {
                    // mettre à jour le modèle
                    vm.allNurses = response;
                });


        },
        dependencies: {
            datah: constants.serviceDataHandler,
            utils: constants.serviceUtils,
            toasts: constants.serviceMdToast
        }
    };

    this.views.displayNonAffectedPatients = {
        label: "Liste des patients non affectés",
        urlPattern: "/nonAffectedPatients",
        url: "/nonAffectedPatients",
        template: require("./nonAffectedPatients-template.html"),
        controller: function (datah, utils, toasts) {

            var vm = this;

            // demander les patients non affectés
            this.updateDatas = function () {

                utils.newDistantRepetedRequest(
                    vm,
                    toasts,
                    function () {
                        return datah.getNonAffectedPatients();
                    },
                    function (response) {
                        // mettre à jour le modèle
                        vm.nonAffectedPatients = response;
                    });

                // demande les infirmieres
                utils.newDistantRepetedRequest(
                    vm,
                    toasts,
                    function () {
                        return datah.getNurses();
                    },
                    function (response) {

                        // mettre à jour le modèle
                        vm.allNurses = response;

                        // fonction d'affectation du nombre de patients
                        var patientsForNurse = function (nurse) {

                            datah.searchPatients({nurseId: nurse.id})
                                .then(function (patients) {
                                    nurse.patientNbr = patients.length;
                                })

                                .catch(function (response) {
                                    console.log(patients);
                                });
                        };

                        // iterer les infirmieres
                        for (var i = 0; i < vm.allNurses.length; i++) {
                            var nurse = vm.allNurses[i];
                            patientsForNurse(nurse);
                        }

                    });
            };

            // premiere mise à jour
            this.updateDatas();
            
        },
        dependencies: {
            datah: constants.serviceDataHandler,
            utils: constants.serviceUtils,
            toasts: constants.serviceMdToast
        }
    };

    this.views.displayAllPatients = {
        label: "Liste de tous les patients",
        urlPattern: "/allPatients",
        url: "/allPatients",
        template: require("./allPatients-template.html"),
        controller: function (datah, utils, toasts) {

            var vm = this;
            utils.newDistantRepetedRequest(
                vm,
                toasts,
                function () {
                    return datah.getAllPatients();
                },
                function (response) {
                    // mettre à jour le modèle
                    vm.allPatients = response;
                });

        },
        dependencies: {
            datah: constants.serviceDataHandler,
            utils: constants.serviceUtils,
            toasts: constants.serviceMdToast
        }
    };

    this.views.displayAllNurses = {
        label: "Liste de tous les infirmiers",
        urlPattern: "/allNurses",
        url: "/allNurses",
        template: require("./allNurses-template.html"),
        controller: function (datah, utils, toasts) {

            var vm = this;
            utils.newDistantRepetedRequest(
                vm,
                toasts,
                function () {
                    return datah.getNurses();
                },
                function (response) {
                    // mettre à jour le modèle
                    vm.allNurses = response;
                });

        },
        dependencies: {
            datah: constants.serviceDataHandler,
            utils: constants.serviceUtils,
            toasts: constants.serviceMdToast
        }
    };

    this.views.displayOfficeInformations = {
        label: "Informations sur le cabinet",
        urlPattern: "/officeInformations",
        url: "/officeInformations",
        template: require("./officeInformation-template.html"),
        controller: function () {
            console.log(this);
        }
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

