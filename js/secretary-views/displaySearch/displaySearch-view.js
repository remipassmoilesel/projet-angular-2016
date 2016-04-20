/**
 * Recherche de patients et d'infirmier
 */

var constants = require('../../utils/constants.js');

module.exports = {
    label: "Rechercher",
    urlPatterns: [
        "/search",
        "/search/:name",
        "/search/:name/:firstname",
        "/search/:name/:firstname/:id",
    ],
    urlSimpleAccess: "/search",
    template: require("./search-template.html"),

    controller: [
        constants.serviceDataHandler,
        constants.serviceUtils,
        constants.serviceMdToast,
        "$routeParams",

        function (datah, utils, serviceMdToast, $routeParams) {

            // récuperer les arguments de l'url pour les transmettre à la recherche
            this.personName = $routeParams['name'] || '';
            this.personFirstname = $routeParams['firstname'] || '';
            this.personId = $routeParams['id'] || '';

        }]
};