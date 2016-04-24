/*
 * Afficher le formulaire d'ajout de patient
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Ajouter un patient",
    urlPatterns: ["/addPatient"],
    urlSimpleAccess: "/addPatient",
    template: require("./addPatient-template.html"),

    controller: [
        constants.serviceDataHandler,
        constants.serviceUtils,
        constants.serviceMdToast,
        function(datah, utils, toasts) {

            /**
             * Mettre à jour les données en demandant de nouvelle données au serveur.
             * @return {[type]} [description]
             */
            this.askForNewDatas = function() {

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

            }


            // demander les infirmières
            var vm = this;
            utils.newDistantRepetedRequest(
                toasts,
                function() {
                    return datah.getNurses();
                },

                function(response) {
                    // mettre à jour le modèle
                    vm.allNurses = response;
                });

        }
    ]

};
