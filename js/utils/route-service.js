/**
 * Gestion des URL
 */

var constants = require("./constants.js");

var RouteService = function ($http, $scope, $interval, $routeParams) {

    console.log("RouteService");

    this.$http = $http;
    this.$scope = $scope;
    this.$interval = $interval;
    this.$routeParams = $routeParams;

    // liste des objets interresses par les changement d'urls
    this.observers = [];

    console.log(this.$http);
    console.log(this.$scope);
    console.log(this.$interval);
    console.log(this.$routeParams);

};
RouteService.$inject = ["$http", "$scope", "$interval", "$routeParams"];

RouteService.prototype.addObserver = function (observer) {
    this.observers.push(observer);
}

module.exports = function (angularMod) {

    // enregistrer les routes possibles dans le module principal
    angularMod.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.when('/search/:name:firstname', {
                templateUrl: '../components/medicalOffice/medicalOffice-template.html',
                controller: 'RouteControl'
            }).otherwise({
                redirectTo: '/search'
            });
        }]);

    // enregistrer le controleur de la route
    angularMod.controller('RouteService', RouteService);

    // enregistrement du service
    var id = constants.serviceRoutes;
    // angularMod.service(id, RouteService);
    return id;
};
