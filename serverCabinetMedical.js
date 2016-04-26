/**
 * Le serveur à été modifié pour permettre la suppression d'un patient,
 * la vérification asynchrone d'identifiants (non utilisée)
 *
 *
 */


/**_________________________________________________________________________________________________________________________________
 * Get external libraries ---------------------------------------------------------------------------------------------------------
 **/
var fs = require('fs-extra') // Access files
    ,
    express = require('express') // Framework to implement HTTP server
    ,
    bodyParser = require("body-parser") // plugin for parsing HTTP requests
    ,
    myDOMParser = require('xmldom').DOMParser // DOM parser 	  (string -> DOM)
    ,
    XMLSerializer = require('xmldom').XMLSerializer // DOM serializer (DOM -> string)
    ,
    multer = require('multer') // plugin for transmiting file via HTTP
    ,
    request = require('request') // send HTTP queries
    ,
    staticGzip = require('http-static-gzip-regexp'),
    libXML = null //require("libxmljs")				// used to verify XML database with respect to a schema
    ,
    xmlSerializer = null,
    domParser = null;

/**_________________________________________________________________________________________________________________________________
 * Save the XML into a file, file acces is asynchronous ----------------------------------------------------------------------------
 *   - doc : the document containing the XML ---------------------------------------------------------------------------------------
 *   - res : the result stream of a client HTTP request ----------------------------------------------------------------------------
 **/
function saveXML(doc, res) {
    fs.writeFile('./data/cabinetInfirmier.xml', xmlSerializer.serializeToString(doc), function(err) { // callback
        if (err) {
            console.error("Error writing ./data/cabinetInfirmier.xml:\n", err);
            res.writeHead(500);
            res.write("Error writing ./data/cabinetInfirmier.xml:\n", err);
        } else {
            res.writeHead(200);
        }
        res.end();
    });
}

/**_________________________________________________________________________________________________________________________________
 * Returns DOM node of patient identified by number in document doc or null if there is no such patient ---------------------------
 **/
function getPatient(doc, number) {
    var L = doc.getElementsByTagName('patient'),
        num_node;
    for (var i = 0; i < L.length; i++) {
        num_node = L[i].getElementsByTagName('numero')[0];
        if (num_node.textContent === number) {
            return L[i];
        }
    }
    return null;
}


/**_________________________________________________________________________________________________________________________________
 * Define HTTP server, implement some ressources -----------------------------------------------------------------------------------
 *   - port : the TCP port on which the HTTP server will be listening --------------------------------------------------------------
 **/
function init(port, applicationServerIP, applicationServerPort) {
    domParser = new myDOMParser() // an instance of DOM parser     (string -> DOM)
    xmlSerializer = new XMLSerializer() // an instance of DOM serializer (DOM -> string)
    var doc // will reference the document representing the XML structure
        , app // will reference the HTTP server
        , applicationServer = {
            ip: applicationServerIP,
            port: applicationServerPort
        } // Application server IP and port that is in charge of optimizing nurses' travels, by default, this server
    ;

    // Read and parse the XML file containing the data
    fs.readFile(__dirname + '/data/cabinetInfirmier.xml', function(err, dataObj) {
        if (err) {
            console.error("Error while reading file /data/cabinetInfirmier.xml", err);
        } else {
            try {
                var data = ""; //new String();
                data = data.concat(dataObj);
                doc = domParser.parseFromString(data, 'text/xml');
                console.log("/data/cabinetInfirmier.xml successfully parsed !");
            } catch (err2) {
                console.error('Error while parsing /data/cabinetInfirmier.xml', err2);
            }
        }
    });

    // Initialize the HTTP server
    app = express();
    app.use(staticGzip(/^\/?dist\/.*(\.js|\.css)$/));
    app.use(express.static(__dirname)) // Associate ressources for accessing local files
        .use(bodyParser.urlencoded({
            extended: false
        })) // Add a parser for urlencoded HTTP requests
        .use(bodyParser.json()) // Add a parser for json HTTP request
        .use(multer({
            dest: './uploads/'
        }).array()) // Add a parser for file transmission
        .listen(port); // HTTP server listen to this TCP port


    app.disable('etag');

    /**
     * Sert le contenu de la page d'accueil.
     * @param {type} res
     * @returns {undefined}
     */
    function serveStartPage(res) {

        // console.log('Getting /');
        fs.readFile(__dirname + '/start.html', function(err, data) {

            // erreur lors de la lecture
            if (err) {
                res.writeHead(500);
                return res.end('Error loading start.html : ' + err);
            }

            res.writeHead(200);
            res.write(data.toString());
            res.end();
        });

    }

    /**
     * Distribution des ressource GET
     */
    app.get(/^\/.*/, function(req, res) {
        serveStartPage(res);
    });

    /**
     * Fonction utilitaire de verification d'un couple id/mdp. Procédure simplifiée,
     * nécéssiterai + de travail
     *
     *
     * Renvoi la ressource autorisée ou undefined.
     *
     * @param {type} doc
     * @param {type} login
     * @param {type} passwd
     * @returns {undefined}
     */
    function checkAccess(login, passwd) {

        if (typeof passwd === "undefined" || typeof login === "undefined") {
            return undefined;
        }

        // formatter les identifiants
        passwd = passwd.toLowerCase().trim();
        login = login.toLowerCase().trim();

        // ressources
        var accessTo = undefined;
        var secretaryPage = __dirname + '/secretary.html';
        var nursePage = __dirname + '/nurse.html';

        // verifier les secretaires
        var secretaries = doc.getElementsByTagName("secretaires")[0].getElementsByTagName("secretaire");

        for (var i = 0; i < secretaries.length; i++) {
            var sc = secretaries[i];
            var scl = sc.getElementsByTagName("login")[0].textContent;
            var scp = sc.getElementsByTagName("motdepasse")[0].textContent;

            //            console.log(scl);
            //            console.log(scp);
            //            console.log();

            if (scl === login && scp === passwd) {
                accessTo = secretaryPage;
                break;
            }
        }

        // verifier les infirmieres
        if (accessTo === undefined) {

            var nurses = doc.getElementsByTagName("infirmiers")[0].getElementsByTagName('infirmier');

            for (var i = 0; i < nurses.length; i++) {
                var ns = nurses[i];
                var nsl = ns.getElementsByTagName("login")[0].textContent;
                var nsp = ns.getElementsByTagName("motdepasse")[0].textContent;

                if (nsl === login && nsp === passwd) {
                    accessTo = nursePage;
                    break;
                }
            }
        }

        return accessTo;

    }

    /**
     * URL de connexion. Attend un login et un mot de passe, et sert la page à laquelle
     *  l'utilisateur à accés. La procédure est simplifiée,
     * elle necessiterait l'usage de cookies etc...
     *
     */
    app.post('/', function(req, res) {

        console.log("/, \nreq.body:\n\t", req.body, "\n_______________________");

        // vérifier le mot de passe et le login
        var accessTo = checkAccess(req.body.login, req.body.password);

        // acces autorisé, distribution de la ressource
        if (accessTo !== undefined) {
            fs.readFile(accessTo,
                function(err, data) {
                    if (err) {
                        console.log('500 - Error while loading: ' + accessTo, err);
                        serveStartPage(res);
                        return;
                    }
                    res.writeHead(200);
                    res.write(data.toString());
                    res.end();
                });

        }

        // acces refusé
        else {
            console.log("403 - Access denied: " + req);
            fs.readFile(__dirname + '/accessDenied.html', function(err, data) {
                // erreur lors de la lecture
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading start.html : ' + err);
                }

                res.writeHead(200);
                res.write(data.toString());
                res.end();
            });

            return;
        }
    });

    /**
     * Procédure simplifiée de vérificatio d'identifiant, destinnée à un usage asynchrone.
     * Pas utilisée malheureusement !
     *
     */
    app.post('/lightCheckAccess', function(req, res) {

        console.log("/lightCheckAccess, \nreq.body:\n\t", req.body, "\n_______________________");

        // vérifier le mot de passe et le login
        var accessTo = checkAccess(req.body.login, req.body.password);

        // acces autorisé, distribution de la ressource
        if (accessTo !== undefined) {
            console.log("200 - Acces granted: ", accessTo, req.body);
            res.writeHead(200);
            res.write("Acces granted: " + accessTo);
            res.end();
        }

        // acces refusé
        else {
            console.log("403 - Access denied: ", req.body);
            res.writeHead(403);
            res.write("403 - Access denied: " + req.body);
            res.end();
        }

    });


    // Define HTTP ressource PORT /addPatient, may contains new patient information
    app.post('/addPatient', function(req, res) {
        console.log("/addPatient, \nreq.body:\n\t", req.body, "\n_______________________");
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

        var patients = doc.getElementsByTagName('patients')[0];
        // Is it a new patient or not ?
        var newPatient = getPatient(doc, req.body.patientNumber);
        if (newPatient === null) {
            newPatient = doc.createElement('patient');
            patients.appendChild(newPatient);
        } else { // Erase subtree
            while (newPatient.childNodes.length) {
                newPatient.removeChild(newPatient.childNodes[0]);
            }
        }
        // Name
        var nom = doc.createElement('nom');
        nom.appendChild(doc.createTextNode(req.body.patientName));
        newPatient.appendChild(nom);
        // Forname
        var prenom = doc.createElement('prenom');
        prenom.appendChild(doc.createTextNode(req.body.patientForname));
        newPatient.appendChild(prenom);
        // Social security number
        var numero = doc.createElement('numero');
        numero.appendChild(doc.createTextNode(req.body.patientNumber));
        newPatient.appendChild(numero);
        // Sex
        var sexe = doc.createElement('sexe');
        sexe.appendChild(doc.createTextNode(req.body.patientSex));
        newPatient.appendChild(sexe);
        // Birthday
        var naissance = doc.createElement('naissance');
        naissance.appendChild(doc.createTextNode(req.body.patientBirthday));
        newPatient.appendChild(naissance);
        // Visites
        var visite = doc.createElement('visite');
        visite.setAttribute('date', "2014-12-08");
        newPatient.appendChild(visite);
        // Adress
        var adresse = doc.createElement('adresse');
        newPatient.appendChild(adresse);
        var etage = doc.createElement('etage');
        etage.appendChild(doc.createTextNode(req.body.patientFloor));
        adresse.appendChild(etage);
        var numAdress = doc.createElement('numero');
        // Modification: le numéro d'étage était inséré à la place du numéro de la rue
        numAdress.appendChild(doc.createTextNode(req.body.patientAdressNumber));
        adresse.appendChild(numAdress);
        var rue = doc.createElement('rue');
        rue.appendChild(doc.createTextNode(req.body.patientStreet));
        adresse.appendChild(rue);
        var ville = doc.createElement('ville');
        ville.appendChild(doc.createTextNode(req.body.patientCity));
        adresse.appendChild(ville);
        var codePostal = doc.createElement('codePostal');
        codePostal.appendChild(doc.createTextNode(req.body.patientPostalCode));
        adresse.appendChild(codePostal);

        console.log(xmlSerializer.serializeToString(newPatient));
        saveXML(doc, res);
    });

    // Suppression de patient
    app.post('/removePatient', function(request, response) {

        console.log("/removePatient, \nreq.body:\n\t", request.body, "\n_______________________");

        // le numéro du patient qu'on recherche
        var patientNumber = request.body.patientNumber;
        //var patientNumber = patientToDelete.ssid;

        // verifier qu'il y ai bien un numero de sécurité sociale
        if (typeof patientNumber === "undefined") {
            console.error("400 - Patient number invalid: \n", patientNumber);
            response.writeHead(400);
            response.write("Patient number invalid: \n", patientNumber);
            response.end();
            return;
        }

        // récuperer tous les patients du document
        var patients = doc.getElementsByTagName("patient");

        // rechercher le patient ayant le même numero de sécurité sociale
        var patientFound = false;
        for (var i = 0; i < patients.length; i++) {

            var p = patients[i];
            var pnum = p.getElementsByTagName("numero")[0].textContent;

            // puis le retirer du DOM
            if (pnum === patientNumber) {
                doc.getElementsByTagName("patients")[0].removeChild(p);
                patientFound = true;
                break;
            }
        }

        // pas de patient retiré, erreur
        if (patientFound === false) {
            console.error("400 - Patient not found: \n", patientNumber);
            response.writeHead(400);
            response.write("Patient not found: \n", patientNumber);
            response.end();
            return;
        }

        // ecrire le document
        saveXML(doc, response);

    });

    // Define HTTP ressource POST /affectation, associate a patient with a nurse
    app.post('/affectation', function(req, res) {

        console.log("/affectation, \nreq.body:\n\t", req.body, "\n_______________________");

        if (typeof req.body.infirmier === 'undefined' || typeof req.body.patient === 'undefined') {
            res.writeHead(500);
            res.end("You should specify 'infirmier' with her id and 'patient' with her social security number in your request.");
        } else { // Get node corresponding to the nurse
            var nurse = doc.getElementById(req.body.infirmier);
            if (nurse || req.body.infirmier === 'none') {
                // Get node corresponding to the patient
                var LP = doc.getElementsByTagName('patient'),
                    node_num;
                for (var i = 0; i < LP.length; i++) {
                    node_num = LP[i].getElementsByTagName('numero')[0];
                    if (node_num.textContent === req.body.patient) {
                        if (req.body.infirmier === 'none') {
                            req.body.infirmier = '';
                        }
                        LP[i].getElementsByTagName('visite')[0].setAttribute('intervenant', req.body.infirmier);
                        saveXML(doc, res);
                        break;
                    }
                }
            } else {
                res.writeHead(500);
                res.end("There is no nurse identified by id", req.body.infirmier);
            }
        }
    });



}


/**_________________________________________________________________________________________________________________________________
 * Parse command line parameters and initialize everything ------------------------------------------------------------------------
 **/
var params = {},
    p;
for (var i = 2; i < process.argv.length; i++) {
    p = process.argv[i].split(':');
    params[p[0]] = p[1];
}

var port = params.port || "8080",
    applicationServerIP = params.applicationServerIP || '127.0.0.1',
    applicationServerPort = params.applicationServerPort || port;

console.log("Usage :\n\tnode staticServeur.js [port:PORT] [applicationServerIP:IP] [applicationServerPort:PORT]\n\tDefault port is 8080.\n\tDefault applicationServerIP is 127.0.0.1.\n\tDefault applicationServerPort is the same port than the one used by this HTTP server.");
console.log("HTTP server listening on port " + port);

console.log();
console.log("Attention: version modifiée du serveur original.");
console.log()

init(port, applicationServerIP, applicationServerPort);
