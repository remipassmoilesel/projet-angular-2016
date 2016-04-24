/**
 * Service d'affichage de message via MD-TOAST. Permet d'éviter des affichages multiples
 * intempestifs.
 *
 * A l'avenir il serait pratique d'attribuer un "poids" aux mdtoast pour qu'il y ai une gestion plus
 * fine des priorités d'affichage.
 *
 */

var constants = require("./constants.js");

var MdToastService = function ($http, $mdToast, $interval) {
    this.$http = $http;
    this.$mdToast = $mdToast;
    this.$interval = $interval;

    this.mdToastVisible = false;
};
MdToastService.$inject = ["$http", "$mdToast", "$interval"];

MdToastService.prototype.showMessage = function (message, hiddingDelay, forceDisplay) {
    return this.showToast(
        this.$mdToast.simple()
            .textContent(message)
            .hideDelay(hiddingDelay || 3000),
        forceDisplay
    );
};

/**
 * Afficher une notification de reprise des services
 */
MdToastService.prototype.showServerErrorEnd = function () {
    return this.showMessage("Serveur à nouveau disponible !", 3000, true);
};

/**
 * Afficher un notification de service indisponible
 */
MdToastService.prototype.showServerError = function () {
    return this.showMessage("Serveur indisponible, veuillez patienter ou rafraichir la page.", 10000, true);
};

/**
 * Afficher un notification
 */
MdToastService.prototype.showToast = function (toast, forceDisplay) {

    // Auun message n'est affiché ou l'affichage est forcé: afficher le toast
    if (this.mdToastVisible === false || forceDisplay === true) {

        this.mdToastVisible = true;

        // Afficher le message
        var vm = this;

        return this.$mdToast.show(toast)

            .then(function () {
                vm.mdToastVisible = false;
            })

            .catch(function () {
                vm.mdToastVisible = false;
            });

    }

    // pas d'affichage, renvoyée une promesse qui échoue
    else {
        console.log("Message non affiché: ", toast);
        return new Promise(
            function (resolve, reject) {
                if (typeof reject !== "undefined") {
                    reject("Message non-displayed");
                }
            });
    }

};

module.exports = function (angularMod) {
    var id = constants.serviceMdToast;
    angularMod.service(id, MdToastService);
    return id;
};
