/**
 * Composant de représentation d'un cabinet médical. Comprend un espace de travail et un menu.
 * @type Module medicalOffice-template|Module medicalOffice-template
 */

// récuperer le template et le css
var template = require('./medicalOffice-template.html');
require('./medicalOffice-component.css');

var constants = require('../../utils/constants.js');

var MedicalOfficeController = function (datah, $scope, $compile, serviceMdToast, secretaryRoutes) {

    // conserver une reference vers les services
    this.datah = datah;
    this.$scope = $scope;
    this.$compile = $compile;
    this.serviceMdToast = serviceMdToast;

    // Récupérer les elements à afficher dans le menu
    this.menuElements = secretaryRoutes.getViews();

};

// injection de dépendance sous forme d'un tableau de chaine de caractères
MedicalOfficeController.$inject = [constants.serviceDataHandler, "$scope", "$compile",
    constants.serviceMdToast, constants.serviceSecretaryRoutes];

module.exports = function (angularMod) {

    // création du composant cabinet medical
    angularMod.component("medicalOffice", {
        template: template,
        controller: MedicalOfficeController
    });
};
