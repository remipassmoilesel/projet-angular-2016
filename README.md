# Projet de Cabinet Médical

Objectif: apprendre à utiliser Angular 1.5

Requiert Git, Node et Gulp. Optimisé pour le navigateur Google Chrome.

Utilisation:

```
	$ git clone https://github.com/remipassmoilesel/projetAngular2015
	$ cd projetAngular2015
	$ npm install
	$ gulp

	# puis dans un autre terminal
	$ node serverCabinetInstall.js
```

### /!\ Les fichiers gulpfile.js et serverCabinetMedical.js ont été modifié.

Réalisé conjointement par:
* https://github.com/AmiraHamrouni
* https://github.com/zer0mode
* https://github.com/remipassmoilesel

## Caractéristiques
* Utilisation de la syntaxe de composant d'Angular
* Utilisation d'Angular Matérial: toasts, drag and drop, formulaires, ...
* Utilisation des routes: instanciation dynamique et utilisation des paramètres de route

## Les petits plus
* La mise en cache des résultats des requêtes asynchrones pour optimiser le chargement de la page
* La prise en compte des interruptions de service possibles (indisponibilités coté serveur)
* Création de services personnalisés Angular, certains avec syntaxe "factory"
* La possibilité de supprimer un patient
* La possibilité de rechercher des patients et des infirmiers
* L'utilisation des routes Angular, et leur déclaration dynamique
* L'utilisation du drag & drop pour l'affectation des patients
* L'utilisation d'outils cartographiques libres: Nominatim (OSM) et Leaflet
* La possibilité de vérification d'identifiants asynchrone (malheureusement non utilisée)
* L'utilisation d'injection de HTML
* Verification du numéro du patient en cas d'ajout

## Les (tous) petits moins
Toutes les vérifications des formulaire n'ont pas été faites, par manque de temps.
Le code n'a pas été testé, par manque de temps.
Pas de tests unitaires.
