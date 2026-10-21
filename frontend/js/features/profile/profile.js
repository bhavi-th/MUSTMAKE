function getToken() {
    return localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
}

function safeSocialUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function optimizeCloudinaryImage(url) {
    if (!url) return url;
    return url.replace(
        /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?![^/]*\b(?:f_auto|q_auto)\b)/,
        "$1f_auto,q_auto,w_400,c_limit/"
    );
}

function readProfileCache() {
    try {
        const data = JSON.parse(sessionStorage.getItem("mustmake_profile") || "null");
        return data?.user && typeof data.user === "object" ? data : null;
    } catch (error) {
        console.warn("Could not read the cached profile.", error);
        return null;
    }
}

function writeProfileCache(data) {
    try {
        sessionStorage.setItem("mustmake_profile", JSON.stringify(data));
    } catch (error) {
        console.warn("Could not cache the profile.", error);
    }
}

function renderProfile(data) {
    const user = data.user;
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileUsername").textContent = `@${user.username}`;

    const age = Number.isInteger(user.age) ? user.age : null;
    const hasAge = age !== null;
    document.getElementById("profileAge").textContent = hasAge ? age : "";
    document.getElementById("profileAgeSection").hidden = !hasAge;

    const hasHeight = user.height !== null && user.height !== undefined &&
        String(user.height).trim() !== "";
    document.getElementById("profileHeight").textContent = hasHeight
        ? user.height
        : "";
    document.getElementById("profileHeightSection").hidden = !hasHeight;

    const hasWeight = user.weight !== null && user.weight !== undefined &&
        String(user.weight).trim() !== "";
    document.getElementById("profileWeight").textContent = hasWeight
        ? user.weight
        : "";
    document.getElementById("profileWeightSection").hidden = !hasWeight;

    const hasProfileDetails = hasAge || hasHeight || hasWeight;
    document.getElementById("profileDetails").hidden = !hasProfileDetails;
    document.getElementById("profileIs").hidden = !hasProfileDetails;

    const photo = document.getElementById("profilePhoto");
    photo.src = user.profilePicture
        ? optimizeCloudinaryImage(user.profilePicture)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200`;

    displaySocials(user.socials);
}

async function loadProfile() {
    const cachedProfile = readProfileCache();
    if (cachedProfile) renderProfile(cachedProfile);

    try {
        const response = await fetch(`${window.API_URL}/api/profile`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load profile.");
        }

        const data = await response.json();
        writeProfileCache(data);
        renderProfile(data);
    } catch (error) {
        console.error(error);
        if (!cachedProfile) {
            document.getElementById("profileName").textContent =
                "Could not load profile.";
        }
    }
}

function displaySocials(socials) {
    const container = document.getElementById("socialLinks");
    container.innerHTML = "";

    if (!socials) {
        container.textContent = "No social links added.";
        return;
    }

    let found = false;

    const links = Array.isArray(socials) ? socials : Object.values(socials);
    links.forEach(value => {
        const href = safeSocialUrl(value);
        if (href) {
            found = true;
            const link = document.createElement("a");
            link.href = href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = href;
            link.title = href;
            container.appendChild(link);
        }
    });

    if (!found) {
        container.textContent = "No social links added.";
    }
}

loadProfile();
