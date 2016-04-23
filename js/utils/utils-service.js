/*
 * Objet rassemblant les diverses méthode utilitaires
 *
 *
 *
 *
 */

var constants = require('../utils/constants.js');

function Utils() {}

/**
 * Retourne une date formattée sous la forme dd/mm/yyyy
 * @param {type} date
 * @returns {String|Utils.prototype.getPrettyDate.sep}
 */
Utils.prototype.getPrettyDate = function(date) {

    var sep = "/";

    if (typeof date === "undefined") {
        date = new Date();
    }

    else if (date.constructor !== Date) {
        date = new Date(date);
    }

    return date.getDate() + sep + date.getMonth() + sep + date.getFullYear();

};

/**
 * Conversion de date à partir du format YYYY-MM-DD
 * @param {type} stringDate
 * @returns {undefined}
 */
Utils.prototype.stringToDateObject = function(stringDate) {
    return new Date(stringDate.trim());
};

/**
 * Conversion de date vers le format YYYY-MM-DD
 * @param {type} stringDate
 * @returns {undefined}
 */
Utils.prototype.dateObjectToString = function(objectDate) {
    return objectDate.toISOString().substr(0, 10);
};

/**
 * Pure fonction javascript, plus longue à lire qu'a utiliser.
 *
 * Permet de renouveller une action si elle échoue, et de prévenir l'utilisateur.
 * A utiliser dans les requetes asynchrones. La requete est éxécutée une fois
 * (funcpromise) et si elle réussi rien ne se passe d'autre.
 *
 * Si elle échoue alors un compteur est déclenché qui tentera de renouveller cette requete
 * indéfiniment (mettre un maximum ?)
 *
 * Si elle échoue plus de 4 fois un message averti l'utilisateur.
 *
 * /!\ Attention à l'environnement dans lequel s'éxécute funcPromise
 *
 * Test possible: utiliser testServerInterruption.sh
 *
 * @param toastService Utilisé pour afficher d'éventuels messages
 * @param funcPromise La requete
 */
Utils.prototype.newDistantRepetedRequest = function(toastService, funcPromise, cbSuccess, cbCatch) {

    var vm = this;

    // initialisation de variables pour suivre les requetes en cours
    if (typeof funcPromise.utilsRequestAttempts === "undefined") {
        funcPromise.utilsRequestAttempts = 0;
        funcPromise.utilsRequestInterval = undefined;
    }

    funcPromise()

    // requete réussie
    .then(function(response) {

        // notification de reprise si nécéssaire
        if (funcPromise.utilsRequestAttempts > 4) {
            toastService.showServerErrorEnd();
        }

        // remettre à zéro les compteurs
        funcPromise.utilsRequestAttempts = 0;
        clearInterval(funcPromise.utilsRequestInterval);
        funcPromise.utilsRequestInterval = undefined;

        if (typeof cbSuccess !== "undefined") {
            cbSuccess(response);
        }

    })

    // requete ratée: signaler éventuellement puis réessayer
    .catch(function(response) {

        console.log("Request fail, tentative: " + funcPromise.utilsRequestAttempts,
            funcPromise, response);

        // lancer un compteur si aucun compteur correspondant n'est encore lancé
        if (typeof funcPromise.utilsRequestInterval === "undefined") {

            funcPromise.utilsRequestAttempts = 1;

            funcPromise.utilsRequestInterval = setInterval(function() {
                // re-executer funcPromise
                vm.newDistantRepetedRequest(toastService, funcPromise, cbSuccess, cbCatch);
            }, 700);
        }

        funcPromise.utilsRequestAttempts++;

        // notification si arrêt prolongé du service
        if (funcPromise.utilsRequestAttempts === 4) {
            toastService.showServerError();
        }

        if (typeof cbCatch !== "undefined") {
            cbCatch(response);
        }

    });

};

module.exports = function(angularMod) {
    var id = constants.serviceUtils;
    angularMod.service(id, Utils);
    return id;
};
