/**
 * Formulaire d'inscription et de modification de patient.
 * @type Module formNewPatient-template|Module formNewPatient-template
 */

// récuperer le template et le css
var template = require('./patientForm-template.html');
require('./patientForm-component.css');
var constants = require('../../utils/constants');

var PatientFormController = function ($http, datah, $scope, mdToastService, $timeout) {

    // conserver les références des services
    this.$http = $http;
    this.datah = datah;
    this.$scope = $scope;
    this.mdToastService = mdToastService;

    // récupérer les infirmières en cache (et pas en cash !)
    var vm = this;
    datah.getNurses().then(function(nurses) {
        vm.nurses = nurses;
    });

    // identifiant unique de formulaire
    this.formId = new Date().getTime();

    // pattern affectant les champs de texte
    this.patientInfoPattern = constants.patientInformationPattern;
    this.ssidPattern = constants.ssidPattern;
    this.postcodePattern = constants.postcodePattern;

    // dates utilisées dans les vérifications de formulaires
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.lowestDate = new Date(1900, 01, 01);
    this.highestDate = new Date();

    // par défaut le bouton affiche ce texte
    this.buttonValidText = "Mettre à jour le patient";

    // si aucun patient n'est fourni, alors c'est un formulaire d'ajout. Changer le texte du bouton.
    if (typeof this.patient === "undefined") {
        this.buttonValidText = "Ajouter le patient";
    }

    // l'état du fomulaire, défini uniquement si non fourni en argument
    if (typeof this.disabled === "undefined") {
        this.disabled = false;
    }

    // genres lisibles
    var genders = {"M": "Homme", "F": "Femme", "A": "Autre", "I": "Indéterminé"};
    this.prettyGender = this.patient ? genders[this.patient.gender] || genders["I"] : genders["I"];
    // messages d'erreur
    this.formErrors = {
        'fillForm': {
            label: 'Formulaire invalide',
            message: 'Vous devez remplir le formulaire.'
        },
        'name': {
            label: 'Nom invalide',
            message: 'Seuls les caractères suivants sont autorisés: [a-zA-Z ]'
        },
        'firstname': {
            label: 'Prénom invalide',
            message: 'Seuls les caractères suivants sont autorisés: [a-zA-Z ]'
        },
        'ssidInvalid': {
            label: 'Numéro de sécurité sociale invalide',
            message: 'Ce numéro est invalide. Le code doit faire 15 chiffres.'
        },
        'ssidExist': {
            label: 'Patient existant',
            message: 'Ce numéro de sécurité sociale existe déjà'
        }

    };

    // option de désaffectation, à ajouter tardivement
    var vm = this;
    $timeout(function () {
        vm.nurses.push({
            name: "Aucun",
            id: ""
        });
    });


};

// injection de dépendance sous forme d'un tableau de chaine de caractères
PatientFormController.$inject = ["$http", constants.serviceDataHandler, "$scope",
    constants.serviceMdToast, "$timeout"];

/**
 * Valider le formulaire et l'envoyer
 * @returns {undefined}
 */
PatientFormController.prototype.validFormAndSendData = function () {

    // vérfier les informations
    if (typeof this.patient === "undefined") {
        this.showFormError("fillForm");
        return;
    }
    /*
     * /!\ Penser à vérifier si les variables sont indéfinies, ou le test regex passera
     */
    var simpleInfoPattern = new RegExp(this.patientInfoPattern);
    // verifier le nom
    if (typeof this.patient.name === "undefined" || simpleInfoPattern.test(this.patient.name) === false) {
        this.showFormError("name");
        return;
    }

    // vérifier le nom
    if (typeof this.patient.firstname === "undefined" || simpleInfoPattern.test(this.patient.firstname) === false) {
        this.showFormError("firstname");
        return;
    }

    // vérifier le ssid
    var ssidPattern = new RegExp(this.ssidPattern);
    if (typeof this.patient.ssid === "undefined" || ssidPattern.test(this.patient.ssid) === false) {
        this.showFormError("ssidInvalid");
        return;
    }

    // ajout du patient, déclenché plus bas en fonction de l'autorisation de modification
    var vm = this;
    var pushDatas = function () {

        vm.mdToastService.showMessage("Enregistrement en cours...");

        // envoyer le patient
        vm.datah.addPatient(vm.patient).then(
            // réussi
            function (response) {
                vm.mdToastService.showMessage("Enregistrement réussi.", undefined, true);

                // notification du composant parent
                if (typeof vm.onFormValidated !== "undefined") {
                    vm.onFormValidated();
                }
            })
            // non réussi
            .catch(function (response) {
                vm.mdToastService.showMessage("Erreur lors de l'enregistrement.", undefined, true);
            });


    };

    // Si la modification n'est pas autorisée, verifier si le patient existe deja

    if (this.allowModifyExistingPatient === "false") {
        this.datah.searchPatients({ssid: this.patient.ssid})
            .then(function (response) {

                if (response.length > 0) {
                    vm.showFormError("ssidExist");
                } else {
                    pushDatas();
                }
            });
    }

    // si la modification est autorisée, effectuer la requete sans verification
    else {
        pushDatas();
    }


};
/**
 *
 * @param {type} message
 * @param {type} delay
 * @returns {undefined}
 */
PatientFormController.prototype.showFormError = function (element) {

    var vm = this;
    this.mdToastService.showToast(
        {
            hideDelay: 6000,
            position: 'top right',
            controller: function () {
                this.formErrorLabel = vm.formErrors[element].label;
                this.formErrorMessage = vm.formErrors[element].message;
            },
            controllerAs: "$ctrl",
            template: require("./patientFormToast.html"),
            locals: {
                element: element
            }
        });
};


module.exports = function (angularMod) {

    angularMod.component("formPatient", {
        template: template,
        controller: PatientFormController,
        bindings: {
            /*
             * Les informations du patient à afficher
             */
            patient: "<",
            /*
             * Si vrai, le formulaire ne fera qu'afficher les informations
             */
            disabled: "<",
            /**
             * Si faux, le formulaire empêche de modifier un patient
             */
            allowModifyExistingPatient: "@",
            /*
             * Fonction optionnelle qui sera appelée lors de l'envoi du formulaire
             */
            onFormValidated: "&"
        }
    });
};
