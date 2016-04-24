/**
 * Point d'entrée de connexion
 */


// Chargement d'angular
var angular = require("angular");

// Elements d'interface
var angularMaterial = require("angular-material");
require("angular-material/angular-material.css");

// Messages d'erreur pour champs input
require("angular-messages");

// Transition douces animées
require("angular-animate");

// déclarer un module pour le l'ecran d'accueil
var welcomeModule = angular.module("welcomeModule", [angularMaterial, 'ngMessages', 'ngAnimate']);

// enregistrer le service de traitement des données
require("./utils/datahandler-service.js")(welcomeModule);

// ecran de connection
require("./components/connexionForm/connexionForm-component.js")(welcomeModule);
