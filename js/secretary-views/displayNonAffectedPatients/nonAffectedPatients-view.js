/**
 * Afficher tous les patients non affectés
 */

var constants = require('../../utils/constants.js');

require("./nonAffectedPatients-template.css");

module.exports = {
    label: "Liste des patients non affectés",
    urlPatterns: ["/nonAffectedPatients"],
    urlSimpleAccess: "/nonAffectedPatients",
    template: require("./nonAffectedPatients-template.html"),

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

                // mise à jour des patients, puis des patients non affectés
                utils.newDistantRepetedRequest(
                    toasts,
                    function() {
                        return datah.getUpdatedPatients().then(function() {
                            return datah.getNonAffectedPatients();
                        });
                    },

                    function(response) {

                        // mettre à jour les patients
                        vm.nonAffectedPatients = response;

                        // mettre à jour les infirmiers
                        datah.getNurses().then(function(response) {
                            vm.nurses = response;
                        });

                    });

            }



            // première mise à jour
            datah.getNonAffectedPatients().then(function(response) {
                vm.nonAffectedPatients = response;
            });
            datah.getNurses().then(function(response) {
                vm.nurses = response;
            });

        }
    ]
};
