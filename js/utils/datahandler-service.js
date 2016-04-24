/**
 *
 * Equivalent renommé du Noyau Fonctionnel du TP. Permet de manipuler
 * les données (consultation et modification)
 *
 * Pour chaque type de données, deux méthodes sont disponible. Une permet
 * d'accéder à des données mises en cache et l'autre d'accéder aux données
 * du serveur. Préférer l'accés au cache.
 *
 * La fonction asyncXmlParse est juste une fonction utilitaire qui permet de
 * réduire un peu le code.
 *
 */


var constants = require("./constants.js");

var DataHandler = function($http, $q) {

    this.$http = $http;
    this.$q = $q;

    // liste des patients
    this.patients = undefined;

    // liste des infirmiers
    this.nurses = undefined;

    // liste des actes médicaux
    this.actions = undefined;

    // informations sur le bureau
    this.officeInformations = undefined;

};

/**
 * Fonction utilitaire permettant d'harmoniser le code des promesses pour les différentes extractions XML
 *
 * @param {type} $http
 * @param {type} dataLocation
 * @param {type} callbackThen
 * @param {type} callbackError
 * @returns {Promise}
 */
DataHandler.prototype.asyncXmlParse = function(dataLocation) {

    // appel asynchrone des données
    return this.$http.get(dataLocation)

    // appel réussi
    .then(function(response) {

        // parser les données
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(response.data, "text/xml");

        return xmlDoc;
    });

};

/**
 * Méthode utilitaire permettant d'gréger le contenu de plusieurs balises XML
 * @param {type} domElement
 * @returns {DataHandler.prototype.agregate.output|String}
 */
DataHandler.prototype.agregate = function(domElement) {

    var output = "";

    for (var i = 1; i < arguments.length; i++) {
        var sel = arguments[i];
        try {
            output += domElement.querySelector(sel).innerHTML + " ";
        } catch (err) {
            console.log("Error while agregating: " + err);
        }
    }

    return output;
};

/**
 * Méthode utilitaire permettant de faire une copie profonde resultat
 * @param {type} domElement
 * @returns {DataHandler.prototype.agregate.output|String}
 */
DataHandler.prototype.copy = function(o) {

    if (typeof o === "undefined") {
        throw "Object cannot be undefined";
    }

    return JSON.parse(JSON.stringify(o));
};

/**
 * Obtenir des informations sur le cabinet. Les informations proviennent d'un cache.
 * Renvoi une promesse Angular.
 *
 * @returns {Promise}
 */
DataHandler.prototype.getOfficeInformations = function() {

    //console.log("DataHandler.prototype.getOfficeInformations = function() {");
    var vm = this;

    // les données n'existent pas, aller les chercher
    if (typeof this.officeInformations === "undefined") {
        return this.getUpdatedOfficeInformations();
    }

    // les données existent, les resservir
    else {
        return this.$q(function(resolve, reject) {
            // renvoyer une copie
            resolve(vm.copy(vm.officeInformations));
        });
    }

};

/**
 * Obtenir des informations fraiches sur le cabinet et mettre à jour le cache.
 * Renvoi une promesse Angular.
 * @return {[type]} [description]
 */
DataHandler.prototype.getUpdatedOfficeInformations = function() {

    //console.log("DataHandler.prototype.getUpdatedOfficeInformations = function() {");

    var vm = this;
    return this.asyncXmlParse(constants.dataOffice)
        .then(function(xmlDoc) {

            // iterer et formatter les informations
            var result = {
                name: xmlDoc.querySelector("cabinet nom").innerHTML,
                adressComplete: vm.agregate(xmlDoc, "cabinet adresse numero", "cabinet adresse rue", "cabinet adresse ville", "cabinet adresse codePostal")
            };

            // mettre à jour le cache
            vm.officeInformations = result;

            // renvoyer une copie
            return vm.copy(result);
        });

};

/**
 * Renvoi une promesse qui retourne un tableaux d'objet sur les infirmiers
 *
 * Les informations proviennet d'un cache
 *
 * @returns {Promise}
 */
DataHandler.prototype.getNurses = function() {

    //console.log("DataHandler.prototype.getNurses = function() {");

    var vm = this;

    // les données n'existent pas, aller les chercher
    if (typeof this.nurses === "undefined") {
        return this.getUpdatedNurses();
    }

    // les données existent, les resservir
    else {
        return this.$q(function(resolve, reject) {
            // renvoyer une copie
            resolve(vm.copy(vm.nurses));
        });
    }

}


/**
 * Renvoi une promesse qui retourne des données fraiches sur les infirmiers,
 * et met à jour le cache.
 * @returns {Promise}
 */
DataHandler.prototype.getUpdatedNurses = function() {

    var vm = this;

    return this.asyncXmlParse(constants.dataOffice)
        .then(function(xmlDoc) {

            //console.log("DataHandler.prototype.getUpdatedNurses = function() {");

            var output = [];
            var nurseTags = xmlDoc.querySelector("infirmiers").getElementsByTagName("infirmier");

            // récupérer les informations sur les infirmiers
            for (var i = 0; i < nurseTags.length; i++) {
                var tag = nurseTags[i];
                output.push({
                    name: tag.querySelector("nom").innerHTML,
                    firstname: tag.querySelector("prenom").innerHTML,
                    imagePath: tag.querySelector("photo").innerHTML,
                    id: tag.getAttribute("id")
                });
            }

            vm.nurses = output;

            return vm.copy(output);
        });
};


/**
 * Renvoi une promesse qui retourne un tableaux d'objet sur les patients
 *
 * Les données proviennent d'un cache
 *
 * @returns {Promise}
 */
DataHandler.prototype.getPatients = function() {

    //console.log("DataHandler.prototype.getPatients = function() {");
    var vm = this;

    // les données n'existent pas, aller les chercher
    if (typeof this.patients === "undefined") {
        return this.getUpdatedPatients();
    }

    // les données existent, les resservir
    else {
        return this.$q(function(resolve, reject) {
            resolve(vm.copy(vm.patients));
        });
    }

}

/**
 * Renvoi une promesse qui retourne un tableaux d'objet sur les patients
 *
 * Elles sont fraiches mes données !
 *
 * @returns {Promise}
 */
DataHandler.prototype.getUpdatedPatients = function() {

    //console.log("DataHandler.prototype.getUpdatedPatients = function() {");

    var vm = this;
    return this.asyncXmlParse(constants.dataOffice)
        .then(function(xmlDoc) {

            var output = [];

            var patientTagArray = xmlDoc.querySelector("patients").getElementsByTagName("patient");

            // itérer les patients
            for (var i = 0; i < patientTagArray.length; i++) {
                var patientTag = patientTagArray[i];

                // récuperer les informations sur le patient
                var tmp;
                var patientObj = {
                    name: patientTag.querySelector("nom").innerHTML.trim(),
                    firstname: patientTag.querySelector("prenom").innerHTML.trim(),
                    gender: patientTag.querySelector("sexe").innerHTML.trim(),
                    birthdate: new Date(patientTag.querySelector("naissance").innerHTML.trim()),
                    ssid: patientTag.querySelector("numero").innerHTML.trim(),
                    adressComplete: vm.agregate(patientTag, "adresse numero", "adresse rue", "adresse codePostal", "adresse ville"),
                    adressNumber: (tmp = patientTag.querySelector("adresse numero")) !== null ? tmp.innerHTML.trim() : '',
                    adressStreet: (tmp = patientTag.querySelector("adresse rue")) !== null ? tmp.innerHTML.trim() : '',
                    adressPostcode: (tmp = patientTag.querySelector("adresse codePostal")) !== null ? tmp.innerHTML.trim() : '',
                    adressCity: (tmp = patientTag.querySelector("adresse ville")) !== null ? tmp.innerHTML.trim() : '',
                    adressFloor: (tmp = patientTag.querySelector("adresse etage")) !== null ? tmp.innerHTML.trim() : ''
                };

                // calcul de l'age
                patientObj.age = typeof patientObj.birthdate !== "undefined" ? ((new Date().getTime() - patientObj.birthdate.getTime()) / 31536000000).toFixed(0) : "X";

                // itérer les visites par patient
                patientObj.visits = [];
                var visitTagArray = patientTag.getElementsByTagName("visite");
                for (var j = 0; j < visitTagArray.length; j++) {
                    var visitTag = visitTagArray[j];

                    // récuperer les informations sur la visite
                    var visitObj = {
                        date: visitTag.getAttribute("date"),
                        idNurse: visitTag.getAttribute("intervenant")
                    };

                    // itérer les actes médicaux
                    visitObj.actions = [];
                    var actionTagArray = visitTag.getElementsByTagName("acte");
                    for (var k = 0; k < actionTagArray.length; k++) {
                        var actionTag = actionTagArray[k];

                        visitObj.actions.push(actionTag.getAttribute("id"));
                    }

                    // ajout de la visite à l'objet patient
                    patientObj.visits.push(visitObj);

                }

                // Infirmier associé. L'infirmier associé est celui qui apparait dans la
                // première balise visite
                patientObj.nurseId = patientObj.visits[0] ? patientObj.visits[0].idNurse || '' : '';

                // ajout du patient à l'objet exporté
                output.push(patientObj);
            }

            vm.patients = output;

            return vm.copy(output);
        });
};

/**
 * Retourne une promesse contenant tous les actes médicaux
 * @returns {undefined}
 */
DataHandler.prototype.getActions = function() {

    //console.log("DataHandler.prototype.getActions = function() {");

    var vm = this;

    // les données n'existent pas, aller les chercher
    if (typeof this.actions === "undefined") {
        return this.getUpdatedActions();
    }

    // les données existent, les resservir
    else {
        return this.$q(function(resolve, reject) {
            resolve(vm.copy(vm.actions));
        });
    }
}

/**
 * Retourne une promesse contenant tous les actes médicaux
 * @returns {undefined}
 */
DataHandler.prototype.getUpdatedActions = function() {

    var vm = this;
    return this.asyncXmlParse(constants.dataActions)
        .then(function(xmlDoc) {

            var output = {};

            // rassembler les types d'actes
            output.types = {};
            var typesTags = xmlDoc.querySelector("types").getElementsByTagName("type");
            for (var i = 0; i < typesTags.length; i++) {
                var t = typesTags[i];
                output.types[t.getAttribute("id")] = t.innerHTML.trim().replace(/\s+/i, " ");
            }

            // rassembler les différents actes
            output.actions = {};
            var actionTags = xmlDoc.querySelector("actes").getElementsByTagName("acte");
            for (var i = 0; i < actionTags.length; i++) {
                var a = actionTags[i];
                output.actions[a.getAttribute("id")] = {
                    type: a.getAttribute("type"),
                    key: a.getAttribute("clé"),
                    coeff: a.getAttribute("coef"),
                    description: a.innerHTML.trim().replace(/\s/i, " ")
                };
            }

            vm.actions = output;

            return vm.copy(output);
        });
};

/**
 * Ajoute un patient et retourne la promesse de la requête
 * @param {type} patient
 * @returns {unresolved}
 */
DataHandler.prototype.addPatient = function(patient) {

    if (typeof patient === "undefined") {
        throw constants.NO_PATIENT_DEFINED;
    }

    /*
     Informations requises coté serveur
     req.body.patientName = req.body.patientName || '';
     req.body.patientForname = req.body.patientForname || '';
     req.body.patientNumber = req.body.patientNumber || '';
     req.body.patientSex = req.body.patientSex || '';
     req.body.patientBirthday = req.body.patientBirthday || '';
     req.body.patientFloor = req.body.patientFloor || '';
     req.body.patientStreet = req.body.patientStreet || '';
     req.body.patientPostalCode = req.body.patientPostalCode || '';
     req.body.patientCity = req.body.patientCity || '';
     req.body.patientAdressNumber = req.body.patientAdressNumber || '';
     */

    /*
     // Structure d'un objet patient coté client
     var patientObj = {
     name: patientTag.querySelector("nom").innerHTML,
     firstname: patientTag.querySelector("prenom").innerHTML,
     gender: patientTag.querySelector("sexe").innerHTML,
     birthdate: patientTag.querySelector("naissance").innerHTML,
     ssid: patientTag.querySelector("numero").innerHTML,
     adressComplete: self.agregate(xmlDoc
     , "adresse numero"
     , "adresse rue"
     , "adresse codePostal"
     , "adresse ville"),
     adressNumber: patientTag.querySelector("adresse numero").innerHTML,
     adressStreet: patientTag.querySelector("adresse rue").innerHTML,
     adressPostcode: patientTag.querySelector("adresse codePostal").innerHTML,
     adressCity: patientTag.querySelector("adresse ville").innerHTML,
     adressFloor: patientTag.querySelector("adresse etage").innerHTML
     };
     */

    var dataToSend = {
        patientName: patient.name || '',
        patientForname: patient.firstname || '',
        patientSex: patient.gender || '',
        patientBirthday: patient.birthdate || '',
        patientNumber: patient.ssid || '',
        patientStreet: patient.adressStreet || '',
        patientPostalCode: patient.adressPostcode || '',
        patientCity: patient.adressCity,
        patientFloor: patient.adressFloor || '',
        patientAdressNumber: patient.adressNumber || ''
    };

    // enregistrer le patient
    var vm = this;
    return this.$http.post("/addPatient", dataToSend)

    // et eventuellement l'affecter
    .then(function(response) {
        if (typeof patient.nurseId !== "undefined" && patient.nurseId !== "") {
            return vm.affectPatient(patient.ssid, patient.nurseId);
        }
    });

};

/**
 * Affecter un patient à un infirmier
 * @param  {[type]} patientId [description]
 * @param  {[type]} nurseId   [description]
 * @return {[type]}           [description]
 */
DataHandler.prototype.affectPatient = function(patientId, nurseId) {

    if (typeof patientId === "undefined") {
        throw constants.NO_PATIENT_DEFINED;
    }
    if (typeof nurseId === "undefined") {
        throw constants.NO_NURSE_DEFINED;
    }

    return this.$http.post("/affectation", {
        patient: patientId,
        infirmier: nurseId
    });

};

/**
 * Renvoi une promesse qui retourne un tableaux d'objet sur les patients sans infirmiers
 * @returns {Promise}
 */
DataHandler.prototype.getNonAffectedPatients = function() {

    return this.getPatients().then(function(patients) {

        var output = [];
        for (var i = 0; i < patients.length; i++) {
            var pat = patients[i];

            if (pat.nurseId === '') {
                output.push(pat);
            }
        }

        return output;
    });

};

/**
 * Renvoi une promesse qui retourne un tableaux de patient correspondant aux critères en argument
 * @returns {Promise}
 */
DataHandler.prototype.searchPatients = function(wanted) {

    return this.getPatients().then(function(patients) {

        var output = [];

        // itérer les patients
        for (var i = 0; i < patients.length; i++) {
            var p = patients[i];

            /*
             * Utilisation d'une méthode simplifiée (pt trop ?) pour tester les patients.
             * Les critéres à comparer sont inséré dans deux tableaux aux mêmes indices.
             * Si les critères sont non-vide ils sont comparés entre eux
             */
            var testsPartA = [];
            var testsPartB = [];

            // nom
            testsPartA.push((wanted.name || '').toLocaleLowerCase().trim());
            testsPartB.push((p.name || '').toLocaleLowerCase().trim());

            // prénom
            testsPartA.push((wanted.firstname || '').toLocaleLowerCase().trim());
            testsPartB.push((p.firstname || '').toLocaleLowerCase().trim());

            // numero infirmier
            testsPartA.push((wanted.nurseId || '').toLocaleLowerCase().trim());
            testsPartB.push((p.nurseId || '').toLocaleLowerCase().trim());

            // numero sécurité sociale
            testsPartA.push((wanted.ssid || '').toLocaleLowerCase().trim());
            testsPartB.push((p.ssid || '').toLocaleLowerCase().trim());

            var passed = 0;
            var success = 0;

            // iterer les tests
            for (var j = 0; j < testsPartA.length; j++) {
                var a = testsPartA[j];
                var b = testsPartB[j];

                // verifier que les parties ne soient pas vides
                if (a.length > 0 && b.length > 0) {
                    passed++;
                    // test
                    if (a === b) {
                        success++;
                    }
                }
            }

            if (success === passed) {
                output.push(p);
            }
        }

        return output;
    });

};

/**
 * Renvoi une promesse qui retourne un tableaux d'infirmiers correspondant aux critères en argument
 * @returns {Promise}
 */
DataHandler.prototype.searchNurses = function(wanted) {

    return this.getNurses().then(function(nurses) {

        var output = [];

        // itérer les patients
        for (var i = 0; i < nurses.length; i++) {
            var p = nurses[i];

            /*
             * Utilisation d'une méthode simplifiée (pt trop ?) pour tester les patients.
             * Les critéres à comparer sont inséré dans deux tableaux aux mêmes indices.
             * Si les critères sont non-vide ils sont comparés entre eux
             */
            var testsPartA = [];
            var testsPartB = [];

            // nom
            testsPartA.push((wanted.name || '').toLocaleLowerCase().trim());
            testsPartB.push((p.name || '').toLocaleLowerCase().trim());

            // prénom
            testsPartA.push((wanted.firstname || '').toLocaleLowerCase().trim());
            testsPartB.push((p.firstname || '').toLocaleLowerCase().trim());

            // identifiant
            testsPartA.push((wanted.id || '').toLocaleLowerCase().trim());
            testsPartB.push((p.id || '').toLocaleLowerCase().trim());

            var passed = 0;
            var success = 0;

            // iterer les tests
            for (var j = 0; j < testsPartA.length; j++) {
                var a = testsPartA[j];
                var b = testsPartB[j];

                // verifier que les parties ne soient pas vides
                if (a.length > 0 && b.length > 0) {
                    passed++;
                    // test
                    if (a === b) {
                        success++;
                    }
                }
            }

            if (success === passed) {
                output.push(p);
            }
        }

        return output;
    });

};

/**
 * Supprime le patient passé en argument
 * @returns {Promise}
 */
DataHandler.prototype.deletePatient = function(patientToDelete) {

    // requete de suppression
    return this.$http.post(
        "/removePatient", {
            patientNumber: patientToDelete.ssid
        });
};

module.exports = function(angularMod) {

    var id = constants.serviceDataHandler;

    // fabrication du service
    angularMod.factory(id, function($http, $q) {
        return new DataHandler($http, $q);
    });

    return id;
};
