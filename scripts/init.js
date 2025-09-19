import { getCookie, setCookie } from './cookieManager.js';

const startButton = document.getElementById("start-button");
const popup = document.getElementById("popup-overlay");

// Fonction pour parser une version X.Y.Z en [X, Y, Z]
function parseVersion(versionStr) {
    return versionStr.trim().split('.').map(num => parseInt(num, 10));
}

function compareVersions(current, stored) {
    // Comparer Majeur et Mineur uniquement
    return current[0] !== stored[0] || current[1] !== stored[1];
}

// Charger et comparer la version
fetch("VERSION.txt")
    .then(res => res.text())
    .then(versionText => {
        const currentVersion = parseVersion(versionText);
        const storedVersionStr = getCookie("gameVersion");

        if (storedVersionStr) {
            const storedVersion = parseVersion(storedVersionStr);
            if (compareVersions(currentVersion, storedVersion)) {
                setCookie("savedCode", "", 30);
                setCookie("lastLevel", 0, 30);
                setCookie("lorePopupShown", "false", 30);
                location.reload();
            }
        }

        // Met à jour la version stockée
        setCookie("gameVersion", versionText.trim(), 30);
    })
    .catch(err => {
        console.error("Erreur de chargement de VERSION.txt :", err);
    });

startButton.addEventListener("click", function () {
    popup.style.display = "none";
    setCookie("lorePopupShown", "true", 30);
});

if (getCookie("lorePopupShown") !== "true") {
    popup.style.display = "";
} else {
    popup.style.display = "none";
}
