document.addEventListener("DOMContentLoaded", () => {
    const year = new Date().getFullYear();
    const element = document.getElementById("copyright");
    if (element) {
        element.textContent = `© Axel Battigelli - ${year}`;
    }
});
