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
        function (datah, utils, toasts) {

            var vm = this;
            utils.newDistantRepetedRequest(
                toasts,
                function () {
                    return datah.getNurses();
                },
                function (response) {
                    // mettre à jour le modèle
                    vm.allNurses = response;
                });

        }]

};