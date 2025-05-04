let levels = [];
let currentLevel = parseInt(getCookie("lastLevel") || "0");
let editor;
let levelValidated = false;

window.addEventListener("DOMContentLoaded", () => {
    editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        mode: "htmlmixed",
        theme: "material",
        lineNumbers: true,
        tabSize: 2,
        placeholder: "Écris ton code HTML ici..."
    });

    editor.on("change", () => {
        setCookie("savedCode", editor.getValue(), 30);
    });

    fetch("levels.json")
        .then(res => res.json())
        .then(data => {
            levels = data;
            if (!Array.isArray(levels) || levels.length === 0) {
                console.error("Le fichier levels.json est vide ou mal formé.");
                return;
            }
            if (currentLevel >= levels.length) {
                currentLevel = 0;
            }
            loadLevel();
        })
        .catch(err => {
            console.error("Erreur de chargement de levels.json :", err);
        });
});

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function loadLevel() {
    levelValidated = false; // reset validation status
    const level = levels[currentLevel];

    let helpLinks = "";
    if (level.help && level.help.length > 0) {
        helpLinks = `
        <div class="help-bubble">
            ❓ Aide
            <div class="help-popup">
            ${level.help.map(h =>
                    `<a href="${h.url}" target="_blank">${escapeHTML(h.label)}</a>`
                ).join("<br>")}
            </div>
        </div>
        `;
    }
    document.getElementById("level-info").innerHTML = `
        <div>
            <h2>${level.title}</h2>
            <p>${level.description}</p>
        </div>
        ${helpLinks}
    `;
    const savedCode = getCookie("savedCode");
    editor.setValue(savedCode || "");
    document.getElementById("feedback").innerText = "";
    document.getElementById("preview").srcdoc = "";
}

function runCode() {
    const code = editor.getValue();
    document.getElementById("preview").srcdoc = code;
}

function checkSolution() {
    const userCode = editor.getValue().trim();
    const level = levels[currentLevel];

    if (level.expected) {
        return showFeedback(userCode === level.expected.trim());
    }

    if (level.expectedContains) {
        const allFound = level.expectedContains.every(part => userCode.includes(part));
        return showFeedback(allFound);
    }

    if (level.validateType === "dom" && level.expectedStructure) {
        return showFeedback(validateDOMStructure(userCode, level.expectedStructure));
    }
}

function validateDOMStructure(code, structure) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");

    function validateElement(selector, expectedStructure) {
        const element = doc.querySelector(selector);
        if (!element)
            return false;

        for (const [tag, condition] of Object.entries(expectedStructure)) {
            const tagElement = element.querySelector(tag);
            if (!tagElement)
                return false;
            if (condition === true && !tagElement) {
                return false;
            }
            if (typeof condition === "string" && tagElement.textContent.trim() !== condition) {
                return false;
            }
        }

        return true;
    }

    for (const [selector, expectedStructure] of Object.entries(structure)) {
        if (!validateElement(selector, expectedStructure)) {
            return false;
        }
    }

    return true;
}

function showFeedback(success) {
    const feedback = document.getElementById("feedback");
    levelValidated = success;
    if (success) {
        feedback.innerText = "✅ Bravo !";
        setCookie("lastLevel", currentLevel + 1, 30); // On stocke le prochain niveau
        setCookie("savedCode", "", 30); // reset of editor content
    } else {
        feedback.innerText = "❌ Ce n'est pas encore ça.";
    }
}

function nextLevel() {
    if (!levelValidated) {
        document.getElementById("feedback").innerText = "⚠️ Tu dois valider ce niveau avant de passer au suivant.";
        return;
    }

    if (currentLevel < levels.length - 1) {
        currentLevel++;
        loadLevel();
    } else {
        document.getElementById("level-info").innerHTML = "<h2>🎉 Tu as terminé tous les niveaux !</h2>";
        document.querySelector(".CodeMirror").style.display = "none";
        document.getElementById("preview").style.display = "none";
    }
}

function resetProgress() {
    setCookie("lastLevel", 0, 30);
    currentLevel = 0;
    editor.setValue("");
    document.querySelector(".CodeMirror").style.display = "block";
    document.getElementById("preview").style.display = "block";
    loadLevel();
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
}
