/*
 * Afficher tous les infirmiers
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Liste de tous les infirmiers",
    urlPatterns: ["/allNurses"],
    urlSimpleAccess: "/allNurses",
    template: require("./allNurses-template.html"),

    controller: [
        constants.serviceDataHandler,
        constants.serviceUtils,
        constants.serviceMdToast,
        function(datah, utils, toasts) {

            var vm = this;
            utils.newDistantRepetedRequest(
                toasts,
                function() {

                    // Uniquement pour pouvoir tester l'interruption de service
                    // return datah.getNurses();
                    return datah.getUpdatedNurses();
                },

                function(response) {
                    // mettre à jour le modèle
                    vm.allNurses = response;
                });

        }
    ]
};
