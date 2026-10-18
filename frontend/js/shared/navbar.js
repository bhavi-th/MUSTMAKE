
(function () {
    "use strict";

    function getCurrentPage() {
        const path = window.location.pathname
            .replace(/\.html$/, "")
            .replace(/\/+$/, "") || "/";

        const legacyRoutes = {
            "/pages/index": "/today",
            "/pages/exercises": "/gst",
            "/pages/competition": "/competition",
            "/pages/profile": "/profile",
            "/pages/login": "/login",
            "/pages/signup": "/signup",
            "/pages/gst": "/gst"
        };

        return legacyRoutes[path] || path;
    }

    function navLink(href, label, currentPage) {
        const normalizedHref = href.replace(/\.html$/, "").replace(/\/+$/, "") || "/";
        const pageAliases = {
            "/pages/index": "/today",
            "/pages/competition": "/competition"
        };
        const activeClass = currentPage === (pageAliases[normalizedHref] || normalizedHref)
            ? ' class="active"'
            : "";
        return `<a href="${href}"${activeClass}>${label}</a>`;
    }

    function getAuthenticationState() {
        try {
            return Boolean(
                localStorage.getItem("token") &&
                JSON.parse(localStorage.getItem("user") || "null")
            );
        } catch {
            return false;
        }
    }

    function initNavbar() {
        const container = document.getElementById("navbar");
        if (!container) return;

        const currentPage = getCurrentPage();
        const isAuthenticated = getAuthenticationState();
        const isLoginPage = currentPage === "/login";
        const menuButtonHTML = isAuthenticated
            ? `<button class="mobile-menu-toggle"
                    type="button"
                    aria-label="Open navigation menu"
                    aria-expanded="false"
                    aria-controls="mobileNavigation">
                    <span></span><span></span><span></span>
                </button>`
            : "";
        const guestActionHTML = isAuthenticated
            ? ""
            : `<a class="mobile-login" href="${isLoginPage ? "/signup" : "/login"}">${isLoginPage ? "Signup" : "Login"}</a>`;
        const navigationHTML = isAuthenticated
            ? `
                <div class="mobile-nav-backdrop" data-mobile-nav-close hidden></div>
                <aside id="mobileNavigation"
                    class="mobile-nav-panel"
                    aria-label="Main navigation"
                    aria-hidden="true"
                    hidden>
                    <div class="mobile-nav-heading">
                        <a class="mobile-nav-brand" href="/pages/index.html">MUSTMAKE</a>
                        <button class="mobile-nav-close"
                            type="button"
                            aria-label="Close navigation menu"
                            data-mobile-nav-close>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m6 6 12 12M18 6 6 18"/>
                            </svg>
                        </button>
                    </div>
                    <nav class="mobile-nav-links" aria-label="Navigation links">
                        ${navLink("/pages/index.html", "ME", currentPage)}
                        ${navLink("/pages/competition.html", "COMMUNITY", currentPage)}
                        ${navLink("/profile", "My profile", currentPage)}
                        <button class="mobile-nav-logout" type="button" data-auth-logout>
                            Logout
                        </button>
                    </nav>
                </aside>
            `
            : "";

        const navbarHTML = `
            <header class="topbar">
                <div class="topbar-start">
                    ${menuButtonHTML}
                    <a class="logo"
                        href="${isAuthenticated ? "/pages/index.html" : "/pages/gst.html"}"
                        aria-label="MUSTMAKE home">
                        MUSTMAKE
                    </a>
                </div>
                ${guestActionHTML}
            </header>
            ${navigationHTML}
        `;

        container.innerHTML = navbarHTML;

        const menuButton = container.querySelector(".mobile-menu-toggle");
        const menuPanel = container.querySelector("#mobileNavigation");
        const backdrop = container.querySelector(".mobile-nav-backdrop");
        const closeButton = container.querySelector(".mobile-nav-close");

        let lastMenuFocus = null;
        let closeTimer = null;

        function closeMobileMenu() {
            if (!menuButton || !menuPanel || menuPanel.hidden) return;

            if (closeTimer !== null) {
                window.clearTimeout(closeTimer);
                closeTimer = null;
            }

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open navigation menu");
            menuPanel.setAttribute("aria-hidden", "true");
            menuPanel.classList.remove("is-open");
            backdrop?.classList.remove("is-visible");
            document.body.classList.remove("mobile-nav-open");

            closeTimer = window.setTimeout(() => {
                menuPanel.hidden = true;
                if (backdrop) backdrop.hidden = true;
                closeTimer = null;
            }, 240);

            lastMenuFocus?.focus();
        }

        function openMobileMenu() {
            if (!menuButton || !menuPanel) return;

            if (closeTimer !== null) {
                window.clearTimeout(closeTimer);
                closeTimer = null;
            }

            lastMenuFocus = menuButton;
            menuPanel.hidden = false;

            if (backdrop) backdrop.hidden = false;

            void menuPanel.offsetWidth;

            menuPanel.classList.add("is-open");
            backdrop?.classList.add("is-visible");

            menuPanel.setAttribute("aria-hidden", "false");
            menuButton.setAttribute("aria-expanded", "true");
            menuButton.setAttribute("aria-label", "Close navigation menu");

            document.body.classList.add("mobile-nav-open");
            closeButton?.focus();
        }

        if (menuButton && menuPanel) {
            menuButton.addEventListener("click", () => {
                if (menuButton.getAttribute("aria-expanded") === "true") {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            });

            container.querySelectorAll("[data-mobile-nav-close]").forEach(element => {
                element.addEventListener("click", closeMobileMenu);
            });

            menuPanel.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", closeMobileMenu);
            });

            document.addEventListener("keydown", event => {
                if (event.key === "Escape") {
                    closeMobileMenu();
                }
            });
        }

        container.querySelectorAll("[data-auth-logout], #logoutButton").forEach(button => {
            button.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
            });
        });

    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNavbar, { once: true });
    } else {
        initNavbar();
    }
})();
