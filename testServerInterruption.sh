#!/bin/bash

# dimanche 17 avril 2016, 16:07:08 (UTC+0200)

echo ""
echo "Test d'interruption de service."
echo ""

echo "Le service de donnée va être interrompu pour tester la manière dont réagit le cabinet medical."
echo "Le cabinet doit avertir l'utilisateur lors de l'interruption et lors de la reprise."
echo ""
echo "Dans 5s, lorsque cela vous sera demandé, cliquez sur 'Liste de tous les infirmiers'."
echo ""

sleep 5

echo "Interruption du service. Cliquez sur 'Liste de tous les infirmiers'."
echo ""

mv data/cabinetInfirmier.xml data/cabinetInfirmier.xml.disabled

sleep 15

mv data/cabinetInfirmier.xml.disabled data/cabinetInfirmier.xml

echo ""
echo "Reprise du service"
