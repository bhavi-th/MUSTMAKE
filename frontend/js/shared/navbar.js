
(function () {
    "use strict";

    function getCurrentPage() {
        const path = window.location.pathname
            .replace(/\.html$/, "")
            .replace(/\/+$/, "") || "/";

        const legacyRoutes = {
            "/pages/index": "/today",
            "/pages/exercises": "/exercises",
            "/pages/competition": "/competition",
            "/pages/profile": "/profile",
            "/pages/login": "/login",
            "/pages/signup": "/signup",
            "/pages/gst": "/gst"
        };

        return legacyRoutes[path] || path;
    }

    function normalizeRoute(href) {
        const path = href.replace(/\.html$/, "").replace(/\/+$/, "") || "/";

        const aliases = {
            "/pages/index": "/today",
            "/pages/competition": "/competition"
        };

        return aliases[path] || path;
    }

    function isRouteActive(href, currentPage) {
        const target = normalizeRoute(href);

        return currentPage === target ||
            (target === "/exercises" &&
                (currentPage === "/gst" || currentPage.startsWith("/exercises/")));
    }

    function navLink(href, label, currentPage) {
        const active = isRouteActive(href, currentPage);

        return `<a href="${href}"${active ? ' class="active" aria-current="page"' : ""}>${label}</a>`;
    }

    function bottomNavLink(href, label, icon, currentPage) {
        const active = isRouteActive(href, currentPage);

        return `
            <a class="bottom-nav-item${active ? " active" : ""}"
               href="${href}"
               aria-label="${label}"
               title="${label}"
               ${active ? 'aria-current="page"' : ""}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    ${icon}
                </svg>
            </a>
        `;
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
            ? `
                <button class="mobile-menu-toggle"
                    type="button"
                    aria-label="Open navigation menu"
                    aria-expanded="false"
                    aria-controls="mobileNavigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            `
            : "";

        const guestActionsHTML = isAuthenticated
            ? ""
            : `
                <nav class="guest-actions" aria-label="Account">
                    ${navLink("/login", "Login", currentPage)}
                    ${navLink("/signup", "Sign up", currentPage)}
                </nav>
            `;

        // Desktop navigation: always displayed at the top-right on large screens.
        const desktopNavigationHTML = isAuthenticated
            ? `
                <nav class="desktop-navigation" aria-label="Desktop navigation">
                    ${navLink("/exercises", "Exercises", currentPage)}
                    ${navLink("/pages/competition.html", "Community", currentPage)}
                    ${navLink("/profile", "Profile", currentPage)}
                    <button class="desktop-nav-logout"
                        type="button"
                        data-auth-logout>
                        Logout
                    </button>
                </nav>
            `
            : "";

        // Slide-out navigation: used on mobile only.
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
                        ${navLink("/pages/edit-profile.html", "Edit profile", currentPage)}
                        ${navLink("/pages/theme.html", "Theme", currentPage)}
                        ${navLink("/pages/about-us.html", "About us", currentPage)}
                        <a href="mailto:tejas49167@gmail.com?subject=Bug%20Report" target="_blank" rel="noopener noreferrer">Report Bug</a>
                        <a href="mailto:tejas49167@gmail.com?subject=Suggestion" target="_blank" rel="noopener noreferrer">Suggestions</a>
                        <button class="mobile-nav-delete-account"
                            type="button"
                            data-auth-delete-account>
                            Delete account
                        </button>
                        <p class="mobile-nav-account-message" role="status" aria-live="polite"></p>

                        <button class="mobile-nav-logout"
                            type="button"
                            data-auth-logout>
                            Logout
                        </button>
                    </nav>
                </aside>
            `
            : "";

        // Mobile bottom navigation: icons only.
        const bottomNavigationHTML = isAuthenticated
            ? `
                <nav class="bottom-navigation" aria-label="Main navigation">

                    ${bottomNavLink(
                        "/exercises",
                        "Exercises",
                        '<path d="M7 7v10M17 7v10M4 9v6M20 9v6M7 12h10"/>',
                        currentPage
                    )}

                    ${bottomNavLink(
                        "/pages/competition.html",
                        "Community",
                        '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20zM15 15a4.5 4.5 0 0 1 5.5 4.5"/>',
                        currentPage
                    )}

                    ${bottomNavLink(
                        "/profile",
                        "Profile",
                        '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-1.5a7 7 0 0 1 14 0V21z"/>',
                        currentPage
                    )}

                    <button class="bottom-nav-item bottom-nav-more mobile-menu-toggle"
                        type="button"
                        aria-label="Open more navigation options"
                        title="More options"
                        aria-expanded="false"
                        aria-controls="mobileNavigation">

                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="5" cy="12" r="1.5"/>
                            <circle cx="12" cy="12" r="1.5"/>
                            <circle cx="19" cy="12" r="1.5"/>
                        </svg>
                    </button>

                </nav>
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

                ${desktopNavigationHTML}
                ${guestActionsHTML}
            </header>

            ${navigationHTML}
            ${bottomNavigationHTML}
        `;

        container.innerHTML = navbarHTML;

        document.body.classList.toggle(
            "has-bottom-navigation",
            isAuthenticated
        );

        const menuButtons = Array.from(
            container.querySelectorAll(".mobile-menu-toggle")
        );

        const menuPanel = container.querySelector("#mobileNavigation");
        const backdrop = container.querySelector(".mobile-nav-backdrop");
        const closeButton = container.querySelector(".mobile-nav-close");

        let lastMenuFocus = null;
        let closeTimer = null;

        function closeMobileMenu() {
            if (!menuPanel || menuPanel.hidden) return;

            if (closeTimer !== null) {
                window.clearTimeout(closeTimer);
                closeTimer = null;
            }

            menuButtons.forEach(button => {
                button.setAttribute("aria-expanded", "false");
                button.setAttribute(
                    "aria-label",
                    button.classList.contains("bottom-nav-more")
                        ? "Open more navigation options"
                        : "Open navigation menu"
                );
            });

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

        function openMobileMenu(trigger) {
            if (!menuPanel) return;

            if (closeTimer !== null) {
                window.clearTimeout(closeTimer);
                closeTimer = null;
            }

            lastMenuFocus = trigger;

            menuPanel.hidden = false;
            if (backdrop) backdrop.hidden = false;

            // Allow the opening animation to run.
            void menuPanel.offsetWidth;

            menuPanel.classList.add("is-open");
            backdrop?.classList.add("is-visible");
            menuPanel.setAttribute("aria-hidden", "false");

            menuButtons.forEach(button => {
                button.setAttribute("aria-expanded", "true");
                button.setAttribute("aria-label", "Close navigation menu");
            });

            document.body.classList.add("mobile-nav-open");
            closeButton?.focus();
        }

        menuButtons.forEach(button => {
            button.addEventListener("click", () => {
                if (button.getAttribute("aria-expanded") === "true") {
                    closeMobileMenu();
                } else {
                    openMobileMenu(button);
                }
            });
        });

        container.querySelectorAll("[data-mobile-nav-close]").forEach(element => {
            element.addEventListener("click", closeMobileMenu);
        });

        menuPanel?.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMobileMenu();
            }
        });

        container.querySelectorAll("[data-auth-logout], #logoutButton").forEach(button => {
            button.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
            });
        });

        const deleteAccountButton = container.querySelector("[data-auth-delete-account]");
        const deleteAccountMessage = container.querySelector(".mobile-nav-account-message");
        deleteAccountButton?.addEventListener("click", async () => {
            const confirmed = window.confirm(
                "Delete your account permanently? This will also delete your profile, workouts, and competition links. This action cannot be undone."
            );
            if (!confirmed) return;

            deleteAccountButton.disabled = true;
            deleteAccountMessage.textContent = "Deleting your account...";

            try {
                const response = await fetch(`${window.API_URL}/api/account`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                    return;
                }
                if (!response.ok) {
                    throw new Error(data.message || "Could not delete your account.");
                }

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                deleteAccountMessage.textContent = "Account deleted. Redirecting...";
                window.setTimeout(() => window.location.replace("/signup"), 600);
            } catch (error) {
                console.error("Account deletion error:", error);
                deleteAccountMessage.textContent = error instanceof TypeError
                    ? "Could not reach the server. Please try again."
                    : error.message || "Could not delete your account.";
                deleteAccountButton.disabled = false;
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNavbar, { once: true });
    } else {
        initNavbar();
    }
})();
