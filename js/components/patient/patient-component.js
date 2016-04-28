/**
 * Composant de représentation d'un patient.
 * @type Module patient-template|Module patient-template
 */

// récuperer le template et le css
var template = require('./patient-template.html');
require('./patient-component.css');


// utilitaires et constantes
var constants = require('../../utils/constants.js');

var PatientController = function($mdDialog, $scope, datah, utils, serviceMdToast) {

    // utilitaires
    this.datah = datah;
    this.$mdDialog = $mdDialog;
    this.$scope = $scope;
    this.utils = utils;
    this.serviceMdToast = serviceMdToast;
    this.smallContent = "100px";
    this.largeContent = "200px";

    // copie des données pour modification dans le formulaire
    this.modificationsData = JSON.parse(JSON.stringify(this.data || {}));
    this.modificationsData.birthdate = new Date(this.modificationsData.birthdate);

    // données formattées à afficher en résumé
    var prettyBirthdate = this.utils.getPrettyDate(this.data.birthdate);
    this.summaryDatas = {
        "Née le": prettyBirthdate + " (" + this.data.age + " ans)",
        "Adresse": this.data.adressComplete
    };

    // les modes d'affichage du patient
    this.availablesDisplayModes = ["summary", "complete", "visits", "modification"];
    this.setDisplayMode("summary");

    this.actions = datah.getActions();

};
PatientController.$inject = ["$mdDialog", "$scope", constants.serviceDataHandler,
    constants.serviceUtils, constants.serviceMdToast
];

/**
 * Fonction déclenchée lors d'un drop d'objet
 * @param nurse
 * @param event
 */
PatientController.prototype.dropHappened = function(nurse, event) {

    // vérifier l'objet passé en paramètre, il doit s'agir d'un infirmier
    if (typeof nurse === "undefined" || typeof nurse.id === "undefined") {
        throw constants.INVALID_ARGUMENT;
    }

    var vm = this;
    this.datah.affectPatient(this.data.ssid, nurse.id)
        .then(function() {
            vm.serviceMdToast.showMessage(
                "Nouvelle attribution: " + vm.data.name + " / " + nurse.name);

            vm.onPatientModified();
        })
        .catch(function() {
            vm.serviceMdToast.showMessage(
                "Erreur lors de l'affectation. Veuillez recommencer.");
        });


};

/**
 * Modifier l'affichage du composant. Par exemple: seulement qqu informations,
 * les visites, le formulaire de modification, ...
 * @param {type} mode
 * @returns {undefined}
 */
PatientController.prototype.setDisplayMode = function(mode) {

    if (this.availablesDisplayModes.indexOf(mode) === -1) {
        throw constants.INVALID_ARGUMENT + ": " + mode;
    }

    this.displayMode = mode;
};
/**
 * Demande confirmation puis supprime un utilisateur.
 * @returns {undefined}
 */
PatientController.prototype.deletePatient = function() {

    // confirmer la suppression avec une boite de dialogue
    var vm = this;
    this.$mdDialog.show({
        controller: function() {
            this.data = vm.data;
            this.hide = function(answer) {
                vm.$mdDialog.hide(answer);
            };
        },
        controllerAs: "$ctrl",
        template: require("./suppressionDialog.html"),
        clickOutsideToClose: false
    })

    // boite fermée, vérifier la réponse
    .then(function(answer) {
        if (answer === true) {

            // supprimer le patient
            vm.datah.deletePatient(vm.data)

            // suppression effective
            .then(function(response) {
                vm.serviceMdToast.showMessage("Suppression effective.");
            })

            // erreur lors de la suppression
            .catch(function(response) {
                vm.serviceMdToast.showMessage(
                    "Erreur lors de la suppression. Veuillez réessayer.",
                    6000, true);

            });

            // notification du composant parent si necessaire
            if (typeof vm.onPatientModified !== "undefined") {
                vm.onPatientModified();
            }
        }
    });

};

/**
 * Demande confirmation puis supprime un utilisateur.
 * @returns {undefined}
 */
PatientController.prototype.showPatientAdressInDialog = function() {

    // confirmer la suppression avec une boite de dialogue
    var vm = this;
    this.$mdDialog.show({
        controller: function() {

            // mettre en forme l'adresse, uniquement si il y a de quoi le faire
            var empty = /^\s*$/i;
            if (vm.data.adressNumber.match(empty) &&
                vm.data.adressStreet.match(empty) &&
                vm.data.adressCity.match(empty) &&
                vm.data.adressPostcode.match(empty)) {
                this.adress = "";
            } else {
                this.adress = vm.data.adressNumber + " " + vm.data.adressStreet + ", " +
                    " " + vm.data.adressPostcode + " " + vm.data.adressCity + ", France";
            }

            // Nom du patient
            this.patientIdentity = vm.data.name + " " + vm.data.firstname;

            /**
             * Masquage du dialogue
             * @param  {[type]} answer [description]
             * @return {[type]}        [description]
             */
            this.hide = function(answer) {
                vm.$mdDialog.hide(answer);
            };
        },
        controllerAs: "$ctrl",
        template: require("./mapDialog.html"),
        clickOutsideToClose: true
    });

};

/**
 * L'utilisateur vient de modifier le patient, notifier le parent si necessaire
 * @returns {undefined}
 */
PatientController.prototype.formHasBeenValidated = function() {

    // notification du composant parent si necessaire
    if (typeof this.onPatientModified !== "undefined") {
        this.onPatientModified();
    }
};

module.exports = function(angularMod) {

    angularMod.component("patient", {
        bindings: {
            /**
             * Les données du patient à afficher
             */
            data: "<",
            /**
             * Une fonction optionnelle qui sera appelée en cas de modification
             */
            onPatientModified: "&",
        },
        controller: PatientController,
        template: template
    });
};
