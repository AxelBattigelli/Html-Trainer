let levels = [];
let currentLevel = parseInt(getCookie("lastLevel") || "0");

fetch("levels.json")
    .then(res => res.json())
    .then(data => {
        levels = data;
        loadLevel();
    });

function loadLevel() {
    const level = levels[currentLevel];
    document.getElementById("level-info").innerHTML = `
    <h2>${level.title}</h2>
    <p>${level.description}</p>
  `;
    document.getElementById("editor").value = "";
    document.getElementById("feedback").innerText = "";
    document.getElementById("preview").srcdoc = "";
}

function runCode() {
    const code = document.getElementById("editor").value;
    document.getElementById("preview").srcdoc = code;
}

function checkSolution() {
    const userCode = document.getElementById("editor").value.trim();
    const level = levels[currentLevel];

    if (level.expected) {
        const expected = level.expected.trim();
        if (userCode === expected) {
            return showFeedback(true);
        } else {
            return showFeedback(false);
        }
    }

    if (level.expectedContains) {
        const allFound = level.expectedContains.every(part => userCode.includes(part));
        return showFeedback(allFound);
    }
}

function showFeedback(success) {
    const feedback = document.getElementById("feedback");
    if (success) {
        feedback.innerText = "✅ Bravo !";
        setCookie("lastLevel", currentLevel + 1, 30); // start at this level the next time
    } else {
        feedback.innerText = "❌ Ce n'est pas encore ça.";
    }
}

function nextLevel() {
    if (currentLevel < levels.length - 1) {
        currentLevel++;
        loadLevel();
    } else {
        document.getElementById("level-info").innerHTML = "<h2>🎉 Tu as terminé tous les niveaux !</h2>";
        document.getElementById("editor").style.display = "none";
        document.getElementById("preview").style.display = "none";
    }
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
