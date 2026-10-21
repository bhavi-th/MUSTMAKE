(() => {
    const themeStorageKey = "mustmake-theme";
    const validThemes = ["light", "dark"];

    function applyTheme(theme, persist = false) {
        if (!validThemes.includes(theme)) return;

        document.documentElement.dataset.theme = theme;
        if (persist) {
            try {
                localStorage.setItem(themeStorageKey, theme);
            } catch (error) {
                console.error("Could not save theme preference:", error);
            }
        }
    }

    let savedTheme = "light";
    try {
        const storedTheme = localStorage.getItem(themeStorageKey);
        if (validThemes.includes(storedTheme)) savedTheme = storedTheme;
    } catch (error) {
        console.error("Could not load theme preference:", error);
    }

    applyTheme(savedTheme);
    window.setColorTheme = theme => applyTheme(theme, true);
})();
