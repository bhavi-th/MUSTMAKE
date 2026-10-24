document.querySelectorAll("[data-password-toggle]").forEach(button => {
    const password = document.getElementById(button.dataset.passwordToggle);
    if (!password) return;

    button.addEventListener("click", () => {
        const showPassword = password.type === "password";
        password.type = showPassword ? "text" : "password";
        button.textContent = showPassword ? "Hide" : "Show";
        button.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"} password`);
        button.setAttribute("aria-pressed", String(showPassword));
    });
});
