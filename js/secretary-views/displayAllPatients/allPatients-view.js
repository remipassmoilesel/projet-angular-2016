/**
 * Affichage de tous les patients
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Liste de tous les patients",
    urlPattern: "/allPatients",
    url: "/allPatients",
    template: require("./allPatients-template.html"),
    controller: function (datah, utils, toasts) {

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

    },
    dependencies: {
        datah: constants.serviceDataHandler,
        utils: constants.serviceUtils,
        toasts: constants.serviceMdToast
    }
};