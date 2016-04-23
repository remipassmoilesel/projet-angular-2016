/**
 * Affichage de tous les patients
 */

var constants = require('../../utils/constants.js');
require('./allPatients-template.css');

module.exports = {
    label: "Liste de tous les patients",
    urlPatterns: ["/allPatients"],
    urlSimpleAccess: "/allPatients",
    template: require("./allPatients-template.html"),

    controller: [
        constants.serviceDataHandler,
        constants.serviceUtils,
        constants.serviceMdToast,

        function(datah, utils, toasts) {

            var vm = this;

            /**
             * Mettre à jour les données en demandant de nouvelle données au serveur.
             * @return {[type]} [description]
             */
            this.askForNewDatas = function() {

                // mise à jour des infirmières
                utils.newDistantRepetedRequest(
                    toasts,
                    function() {
                        return datah.getNurses();
                    },

                    function(response) {

                        // mettre à jour le modèle
                        vm.allNurses = response;

                        // mise à jour des patients
                        utils.newDistantRepetedRequest(
                            toasts,
                            function() {
                                return datah.getUpdatedPatients();
                            },

                            function(response) {
                                // mettre à jour le modèle
                                vm.allPatients = response;
                            });

                    });

            }

            // première mise à jour
            datah.getPatients().then(function(response) {
                vm.allPatients = response;
            });
            datah.getNurses().then(function(response) {
                vm.allNurses = response;
            });

            /**
             * Fonction d'essai d'indisponibilité de serveur
             * @return {[type]} [description]
             */
            this.testServerInterruption = function() {
                var count = 0;
                var max = 10;

                // mise à jour des patients
                utils.newDistantRepetedRequest(
                    toasts,
                    function() {
                        return new Promise(function(resolve, reject) {
                            if (count > max) {
                                resolve();
                            } else {
                                console.log("count");
                                console.log(count);
                                setTimeout(reject, 500);
                                count++;
                            }
                        });
                    },
                    function(response) {
                        // mettre à jour le modèle
                        vm.allPatients = response;
                    });
            }

        }
    ]
};
