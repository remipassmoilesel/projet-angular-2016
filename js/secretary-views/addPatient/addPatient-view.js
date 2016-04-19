/*
 * Afficher le formulaire d'ajout de patient
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Ajouter un patient",
    urlPattern: "/addPatient",
    url: "/addPatient",
    template: require("./addPatient-template.html"),
    controller: function (datah, utils, toasts) {

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

    },
    dependencies: {
        datah: constants.serviceDataHandler,
        utils: constants.serviceUtils,
        toasts: constants.serviceMdToast
    }
};