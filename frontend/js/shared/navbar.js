function getCurrentPage() {
    const path = window.location.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/";
    const legacyRoutes = {
        "/pages/index": "/today",
        "/pages/exercises": "/exercises",
        "/pages/competition": "/competition",
        "/pages/profile": "/profile"
    };

    return legacyRoutes[path] || path;
}

function navLink(href, label, currentPage) {
    const activeClass = currentPage === href ? ' class="active"' : "";
    return `<a href="${href}"${activeClass}>${label}</a>`;
}

const currentPage = getCurrentPage();
let isAuthenticated = false;
try {
    isAuthenticated = Boolean(localStorage.getItem("token") && JSON.parse(localStorage.getItem("user") || "null"));
} catch {
    isAuthenticated = false;
}

const navbarHTML = `
<header class="topbar">
    <a class="logo" href="/exercises" aria-label="MUSTMAKE home">MUSTMAKE</a>
    <nav aria-label="Main navigation">
        ${isAuthenticated
            ? `${navLink("/exercises", "Exercises", currentPage)}
               ${navLink("/today", "Today", currentPage)}
               ${navLink("/competition", "Others", currentPage)}
               ${navLink("/profile", "Profile", currentPage)}`
            : `${navLink("/exercises", "Exercises", currentPage)}
               ${navLink("/login", "Sign in", currentPage)}
               ${navLink("/signup", "Create account", currentPage)}`}
    </nav>
</header>
`;

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("navbar");

    if (container) {
        container.innerHTML = navbarHTML;
    }

    const logoutBtn = document.getElementById("logoutButton");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        });
    }
});
