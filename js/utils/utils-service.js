/*
 * Objet rassemblant les diverses méthode utilitaires
 *
 *
 *
 *
 */

var constants = require('../utils/constants.js');

function Utils() {
    this.SERVICE_RESTORATION = "SERVICE_RESTORATION";
    this.SERVICE_INTERRUPTION = "SERVICE_INTERRUPTION";
}

/**
 * Retourne une date formattée sous la forme dd/mm/yyyy
 * @param {type} date
 * @returns {String|Utils.prototype.getPrettyDate.sep}
 */
Utils.prototype.getPrettyDate = function (date) {

    var sep = "/";

    if (typeof date === "undefined") {
        date = new Date();
    }

    return date.getDate()
        + sep + date.getMonth()
        + sep + date.getFullYear();

};

/**
 * Conversion de date à partir du format YYYY-MM-DD
 * @param {type} stringDate
 * @returns {undefined}
 */
Utils.prototype.stringToDateObject = function (stringDate) {
    return new Date(stringDate.trim());
};

/**
 * Conversion de date vers le format YYYY-MM-DD
 * @param {type} stringDate
 * @returns {undefined}
 */
Utils.prototype.dateObjectToString = function (objectDate) {
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
 * /!\ funcPromise s'éxécute dans l'environnement du controlleur
 *
 * Test possible: utiliser testServerInterruption.sh
 *
 * @param ctx Le contexte d'execution de la requete. Des variables y sont enregistrées sur le nombre
 * de tentatives effectuées, ...
 * @param toastService Utilisé pour afficher d'éventuels messages
 * @param funcPromise La requete
 * @param cbSuccess Executée en cas de succés
 * @param cbCatch Executée en cas d'echec
 */
Utils.prototype.newDistantRepetedRequest = function (toastService, funcPromise, cbSuccess, cbCatch) {

    console.log("newDistantRepetedRequest");
    console.log(toastService);

    var vm = this;

    // initialisation de tableaux de variables pour suivre les requetes en cours
    if (typeof funcPromise.utilsRequestAttempts === "undefined"
        || typeof funcPromise.utilsRequestIntervals === "undefined") {
        funcPromise.utilsRequestAttempts = [];
        funcPromise.utilsRequestIntervals = [];
    }

    console.log("funcPromise");
    console.log(funcPromise);

    funcPromise()

        // requete réussie
        .then(function (response) {

            // notification de reprise si nécéssaire
            if (typeof funcPromise.utilsRequestAttempts[funcPromise] !== "undefined" &&
                funcPromise.utilsRequestAttempts[funcPromise] > 4) {
                toastService.showServerErrorEnd();
            }

            // remettre à zéro les compteurs
            funcPromise.utilsRequestAttempts[funcPromise] = 0;
            clearInterval(funcPromise.utilsRequestIntervals[funcPromise]);
            funcPromise.utilsRequestIntervals[funcPromise] = undefined;

            cbSuccess(response);

        })

        // requete ratée: signaler éventuellement puis réessayer
        .catch(function (response) {

            console.log("Request fail: ", funcPromise, response);

            // lancer un compteur si aucun compteur correspondant n'est encore lancé
            if (typeof funcPromise.utilsRequestIntervals[funcPromise] === "undefined") {

                funcPromise.utilsRequestAttempts[funcPromise] = 1;

                funcPromise.utilsRequestIntervals[funcPromise] = setInterval(function () {
                    // re-executer funcPromise
                    vm.newDistantRepetedRequest(toastService, funcPromise, cbSuccess, cbCatch);
                }, 700);
            }

            funcPromise.utilsRequestAttempts[funcPromise]++;

            // notification si arrêt prolongé du service
            if (funcPromise.utilsRequestAttempts[funcPromise] === 4) {
                toastService.showServerError();
            }

            // execution du cbCatch
            if (typeof cbCatch !== "undefined") {
                cbCatch(response);
            }
        });

};

module.exports = function (angularMod) {
    var id = constants.serviceUtils;
    angularMod.service(id, Utils);
    return id;
};

