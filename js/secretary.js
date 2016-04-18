// feuille de style principale
require("../css/secretary.css");

// Chargement d'angular
var angular = require("angular");

// Elements d'interface
var angularMaterial = require("angular-material");
require("angular-material/angular-material.css");

// Messages d'erreur pour champs input
require("angular-messages");

// Transition douces animées
require("angular-animate");

// gestion des urls
require("angular-route");

/*
 *
 */

// déclarer un module pour le cabinet médical, avec comme dépendance angular-material
var medicalOfficeModule = angular.module("officeModule", [angularMaterial, 'ngMessages', 'ngAnimate','ngRoute']);

// service de gestion des routes
require("./utils/route-service.js")(medicalOfficeModule);

// enregistrer le service de traitement des données
require("./utils/datahandler-service.js")(medicalOfficeModule);

// définir le composant cabinet medical
require("./components/medicalOffice/medicalOffice-component.js")(medicalOfficeModule);

// définir le composant infirmier
require("./components/nurse/nurse-component.js")(medicalOfficeModule);

// définir le composant patient
require("./components/patient/patient-component.js")(medicalOfficeModule);

// définir le composant patient
require("./components/patientForm/patientForm-component.js")(medicalOfficeModule);

// affichage d'informations sur le cabinet
require("./components/displayOfficeInformations/displayOfficeInformations-component.js")(medicalOfficeModule);

// affichage d'informations sur le cabinet
require("./components/jsonPrettyPrint/jsonPrettyPrint-component.js")(medicalOfficeModule);

// recherche de patients
require("./components/searchForm/searchForm-component.js")(medicalOfficeModule);

// recherche de patients
require("./components/visit/visit-component.js")(medicalOfficeModule);

// affichage dans une carte
require("./components/showAdressOnMap/showAdressOnMap-component.js")(medicalOfficeModule);

// service d'affichage de message
require("./utils/mdtoast-service.js")(medicalOfficeModule);



