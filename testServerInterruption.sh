#!/bin/bash

# dimanche 17 avril 2016, 16:07:08 (UTC+0200)

echo "Test d'interruption de service."

echo "Le service de donnée va être interrompu 5s, dans 5s, pour tester la manière dont réagit le cabinet medical." 
echo "Le cabinet doit avertir l'utilisteur lors de l'interruption et lors de la reprise."

sleep 5

echo "Interruption du service"

mv data/cabinetInfirmier.xml data/cabinetInfirmier.xml.disabled

sleep 5

echo "Reprise du service"

mv data/cabinetInfirmier.xml.disabled data/cabinetInfirmier.xml


