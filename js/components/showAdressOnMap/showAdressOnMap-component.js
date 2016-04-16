/**
 * Afficher une adresse dans une carte interactive.
 * 
 * L'adresse doit etre formattée comme suit:
 * numéro_rue type_voie nom_rue, code_postal, ville, pays
 * 
 * @type Module formNewPatient-template|Module formNewPatient-template
 */

// récuperer le template et le css
var template = require('./showAdressOnMap-template.html');
require('./showAdressOnMap-component.css');

// utilitaires et constantes
var utils = require('../../functionnalcore/utils');
var constants = require('../../functionnalcore/constants.js');

// outil cartographique
var L = require("leaflet");
require('leaflet/dist/leaflet.css');

var Controller = function ($http, datah, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.datah = datah;
    this.utils = utils;
    this.$scope = $scope;

    // affichage de messages d'erreur
    this.errorMessage = "";

    // stockage de la position géographique en latitude longitude
    this.adressPosition = undefined;

    // identifiant unique de carte
    // non utilsé pour l'instant
    this.mapHtmlId = "adressOnMap" + new Date().getTime();

    // creation de la carte
    this.map = L.map("mapId");

    // creation et ajot de la couche osm
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});

    this.map.addLayer(osm);

    // creation d'un marqueur pour positionner l'adresse
    this.geoMarkIcon = L.icon({
        iconUrl: '/images/geo-mark.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [20, 0]
    });

    // ajouter la marque
    this.geoMark = L.marker([0, 0], {icon: this.geoMarkIcon}).addTo(this.map);

    // mettre à jour la carte si l'adresse change
    var vm = this;
    this.$scope.$watch(function () {
        return vm.adress;
    }, function () {
        vm.resolveAdress();
    });

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
Controller.$inject = ["$http", constants.serviceDataHandler, "$scope"];

/**
 * Résout l'adresse et l'affiche sur la carte.
 * @returns {undefined}
 */
Controller.prototype.resolveAdress = function () {

    var vm = this;

    // résoudre la position géographique de l'adresse
    this.$http({
        url: 'http://nominatim.openstreetmap.org/search',
        mehtod: "GET",
        params: {
            q: this.adress,
            format: "json"
        }
    })

            // résolue avec succès, peut être....
            .then(function (response) {

                if (response.data.length < 1) {
                    vm.showGeocodingErrorMessage(true);
                    return;
                }

                vm.showGeocodingErrorMessage(false);

                // stocker l'adresse
                vm.adressPosition = [
                    response.data[0].lat,
                    response.data[0].lon];

                // modifier la carte
                vm.setMapView(
                        vm.adressPosition[0],
                        vm.adressPosition[1]
                        );

            })

            // erreur lors de la résolution
            .catch(function (response) {
                vm.showGeocodingErrorMessage(true);
            });

};

/**
 * Afficher un message d'erreur en cas de probleme de geocodage ou le reinitialiser 
 * @param {type} message
 * @returns {undefined}
 */
Controller.prototype.showGeocodingErrorMessage = function (error) {

    if (error) {
        this.errorMessage = "Erreur lors de l'affichage de la carte. Veuillez réessayer.";
        this.buttonText = "Rafraichir";
        this.adressPosition = undefined;
    } else {
        this.errorMessage = "";
        this.buttonText = "Recentrer la carte";
    }
};

/**
 * Modifie l'affichage de la carte pour afficher une position et une marque aux coordonnées
 * passée en parametre
 * @returns {undefined}
 */
Controller.prototype.setMapView = function (lat, lng, zoom, messageHtml) {

    // zoom par défaut
    zoom = zoom || 15;

    // coordonnées
    var latLon = new L.LatLng(lat, lng);

    // modifier l'affichage de la carte
    this.map.setView(latLon, zoom);

    // placer la marque
    this.geoMark.setLatLng(latLon);

    // afficher eventuellement un message 
    if (typeof messageHtml !== "undefined") {
        marker.bindPopup(messageHtml).openPopup();
    }
};

module.exports = function (angularMod) {

    angularMod.component("showAdressOnMap", {
        template: template,
        controller: Controller,
        bindings: {
            adress: "<",
            height: "<"
        }
    });
};
