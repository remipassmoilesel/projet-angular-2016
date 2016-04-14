/**
 * Composant de représentation d'un infirmier
 * @type Module nurse-template|Module nurse-template
 */
// récuperer le template et le css
var template = require('./nurse-template.html');
require('./nurse-component.css');

// utilitaires et constantes
var utils = require('../../functionnalcore/utils.js');
var constants = require('../../functionnalcore/constants.js');

var Controller = function () {

};

module.exports = function (angularMod) {

    angularMod.component("nurse", {
        template: template,
        bindings: {
            data: "<"
        },
        controller: Controller
    });
};