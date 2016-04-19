/*
 * Afficher le formulaire d'ajout de patient
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Liste de tous les infirmiers",
    urlPattern: "/allNurses",
    url: "/allNurses",
    template: require("./allNurses-template.html"),
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