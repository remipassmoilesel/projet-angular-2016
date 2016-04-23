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

            // /**
            //  * Mettre à jour les infirmiers et le nombre de patient
            //  * @return {[type]} [description]
            //  */
            // this.updateNurses = function() {
            //
            //     // récupérer les infirmieres
            //     utils.newDistantRepetedRequest(
            //         toasts,
            //         function() {
            //             return datah.getNurses();
            //         },
            //
            //         function(response) {
            //
            //             // mettre à jour le modèle
            //             vm.allNurses = response;
            //
            //             // fonction d'affectation du nombre de patients
            //             var patientsForNurse = function(nurse) {
            //                 datah.searchPatients({
            //                         nurseId: nurse.id
            //                     })
            //                     .then(function(patients) {
            //                         nurse.patientNbr = patients.length;
            //                     })
            //             };
            //
            //             // iterer les infirmieres
            //             for (var i = 0; i < vm.allNurses.length; i++) {
            //                 var nurse = vm.allNurses[i];
            //                 patientsForNurse(nurse);
            //             }
            //
            //         });
            // }

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
