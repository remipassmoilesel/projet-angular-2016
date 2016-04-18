/**
 * Composant de représentation d'un cabinet médical. Comprend un espace de travail et un menu.
 * @type Module medicalOffice-template|Module medicalOffice-template
 */

// récuperer le template et le css
var template = require('./medicalOffice-template.html');
require('./medicalOffice-component.css');
// utilitaires et constantes
var utils = require('../../utils/utils.js');
var constants = require('../../utils/constants.js');

var MedicalOfficeController = function (datah, $scope, $compile, serviceMdToast, serviceRoute) {

    // conserver une reference vers les services
    this.datah = datah;
    this.$scope = $scope;
    this.$compile = $compile;
    this.serviceMdToast = serviceMdToast;
    this.serviceRoute = serviceRoute;

    /* 
     Les élements affichés dans le menu et les fonctions associées permettant 
     de déclencher les actions. Pour ajouter un element dans le menu, ajouter un objet.
     */
    this.menuElements = require("./menuElements.js");

    // affichage lors de la création du composant
    this.menuElements.displayAllNurses.action(this,
        this.menuElements.displayAllNurses);

    // premiere mise à jour
    this.updateNurses();
    this.updatePatients();

    // écouter les changements d'url
    var vm = this;
    var observer = function (url) {
        console.log("medicalOffice");
        console.log(url);
    }

    // this.serviceRoute.addObserver(observer);


};

// injection de dépendance sous forme d'un tableau de chaine de caractères
MedicalOfficeController.$inject = [constants.serviceDataHandler, "$scope", "$compile", constants.serviceMdToast];

/**
 * Réclame les données sur les patients au serveur
 * @returns {undefined}
 */
MedicalOfficeController.prototype.updateNonAffectedPatients = function () {

    var vm = this;
    this.newWomanRequest(
        vm,
        function () {
            return vm.datah.getNonAffectedPatients();
        },
        function (response) {
            // mettre à jour le modèle
            vm.nonAffectedPatients = response;
        });
};

/**
 * Réclame les données sur les patients au serveur
 * @returns {undefined}
 */
MedicalOfficeController.prototype.updateNurses = function () {

    var vm = this;
    this.newWomanRequest(
        vm,
        function () {
            return vm.datah.getNurses();
        },
        function (response) {
            // mettre à jour le modèle
            vm.allNurses = response;
        });

};

/**
 * Réclame les données sur les patients au serveur
 * @returns {undefined}
 */
MedicalOfficeController.prototype.updatePatients = function () {

    var vm = this;
    this.newWomanRequest(
        vm,
        function () {
            return vm.datah.getAllPatients();
        },
        function (response) {
            // mettre à jour le modèle
            vm.allPatients = response;
        });

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
 * Test possible: lancer le cabinet médical, renommer le fichier source XML puis
 * le renommer à son nom d'origine.
 *
 * @param {type} ctx Le contexte d'execution
 * @param {type} funcPromise
 * @param {type} cbSuccess
 * @param {type} cbCatch
 * @returns {undefined}
 */
MedicalOfficeController.prototype.newWomanRequest = function (ctx, funcPromise, cbSuccess, cbCatch) {

    // initialisation de tableaux de variables pour suivre les requetes en cours
    if (typeof ctx.requestAttempts === "undefined"
        || typeof ctx.requestIntervals === "undefined") {
        ctx.requestAttempts = [];
        ctx.requestIntervals = [];
    }

    funcPromise.apply(ctx)

        // requete réussie
        .then(function (response) {

            // notification de reprise si nécéssaire
            if (typeof ctx.requestAttempts[funcPromise] !== "undefined" &&
                ctx.requestAttempts[funcPromise] > 4) {
                ctx.serviceMdToast.showServerErrorEnd();
            }

            // remettre à zéro les compteurs
            ctx.requestAttempts[funcPromise] = 0;
            clearInterval(ctx.requestIntervals[funcPromise]);
            ctx.requestIntervals[funcPromise] = undefined;

            cbSuccess(response);

        })

        // requete ratée: signaler éventuellement puis réessayer
        .catch(function (response) {

            console.log("Request fail: ", funcPromise, response);

            // lancer un compteur si besoin
            if (typeof ctx.requestIntervals[funcPromise] === "undefined") {

                ctx.requestAttempts[funcPromise] = 1;

                ctx.requestIntervals[funcPromise] = setInterval(function () {
                    // re-executer funcPromise
                    ctx.newWomanRequest(ctx, funcPromise, cbSuccess, cbCatch);
                }, 400);
            }
            ctx.requestAttempts[funcPromise]++;

            // notification si arrêt prolongé du service
            if (ctx.requestAttempts[funcPromise] === 4) {
                ctx.serviceMdToast.showSer;
            }

            // execution du cbCatch
            if (typeof cbCatch !== "undefined") {
                cbCatch(response);
            }
        });

};

/**
 * Afficher une petite pop up d'information
 * @param {type} message
 * @param {type} delay
 * @returns {undefined}
 */
MedicalOfficeController.prototype.showAlert = function (message, delay) {

    this.svcMdDialog.show(
        this.$mdToast.simple()
            .textContent(message)
            .position("top right")
            .hideDelay(delay || 2000)
    );
};


/**
 * Masque tous les elements de menu et affiche l'element passe en parametre
 * @param {type} menuElementToShow
 * @returns {undefined}
 */
MedicalOfficeController.prototype.displaySection = function (menuElementToShow) {

    for (var elmt in this.menuElements) {
        this.menuElements[elmt].visible = false;
    }

    menuElementToShow.visible = true;
};

module.exports = function (angularMod) {

    // création du composant cabinet medical
    angularMod.component("medicalOffice", {
        template: template,
        controller: MedicalOfficeController
    });
};
