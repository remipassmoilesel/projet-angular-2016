/**
 * Recherche de patients et d'infirmier
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Rechercher",
    urlPattern: "/search",
    url: "/search",
    template: require("./search-template.html")
};