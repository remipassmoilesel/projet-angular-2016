/**
 * Affichage d'informations sur le cabinet médical
 */

//var constants = require('../../utils/constants.js');

module.exports = {
    label: "Informations sur le cabinet",
    urlPatterns: ["/officeInformations"],
    urlSimpleAccess: "/officeInformations",
    template: require("./officeInformation-template.html")
};

