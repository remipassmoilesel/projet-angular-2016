/**
 * Afficher les patient non affectés
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
             * Mise à jour des données
             */
            this.updateDatas = function() {

                // récupérer les patients non affectés
                utils.newDistantRepetedRequest(
                    toasts,
                    function() {
                        return datah.getNonAffectedPatients();
                    },

                    function(response) {
                        // mettre à jour le modèle
                        vm.nonAffectedPatients = response;
                    });

                // récupérer les infirmieres
                utils.newDistantRepetedRequest(
                    toasts,
                    function() {
                        return datah.getNurses();
                    },

                    function(response) {

                        // mettre à jour le modèle
                        vm.allNurses = response;

                        // fonction d'affectation du nombre de patients
                        var patientsForNurse = function(nurse) {

                            datah.searchPatients({
                                    nurseId: nurse.id
                                })
                                .then(function(patients) {
                                    nurse.patientNbr = patients.length;
                                })

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

        }
    ]
};
