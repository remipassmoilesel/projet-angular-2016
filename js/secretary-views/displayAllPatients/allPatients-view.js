/**
 * Affichage de tous les patients
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Liste de tous les patients",
    urlPatterns: ["/allPatients"],
    urlSimpleAccess: "/allPatients",
    template: require("./allPatients-template.html"),

    controller: [
        constants.serviceDataHandler,
        constants.serviceUtils,
        constants.serviceMdToast,
        function (datah, utils, toasts) {

            var vm = this;
            utils.newDistantRepetedRequest(
                toasts,
                function () {
                    return datah.getAllPatients();
                },
                function (response) {
                    // mettre à jour le modèle
                    vm.allPatients = response;
                });

        }]
};