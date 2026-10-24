(() => {
    document.documentElement.dataset.theme = "dark";
    try {
        localStorage.removeItem("mustmake-theme");
    } catch (error) {
        console.error("Could not clear the saved theme preference:", error);
    }
})();
