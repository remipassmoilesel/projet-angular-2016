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
            console.log("/search/");
            console.log("$routeParams");
            console.log($routeParams);
        }]
};