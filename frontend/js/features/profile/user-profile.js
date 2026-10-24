const profileRoot = document.getElementById("publicProfile");
const profileToken = localStorage.getItem("token");
const profileId = new URLSearchParams(window.location.search).get("id");
const publicPhotoDialog = document.getElementById("publicPhotoDialog");
const publicPhotoPreview = document.getElementById("publicPhotoPreview");
const closePublicPhoto = document.getElementById("closePublicPhoto");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatWorkoutDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? escapeHtml(value)
        : escapeHtml(date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
}

function workoutDetails(workout) {
    if (workout.reps != null && workout.sets != null) {
        const volume = Number(workout.reps) * Number(workout.sets);
        const weight = workout.weight != null ? ` · ${escapeHtml(workout.weight)} kg` : "";
        return `${escapeHtml(workout.reps)} reps × ${escapeHtml(workout.sets)} sets = ${escapeHtml(volume)} reps${weight}`;
    }
    if (workout.amount != null) {
        const amount = `${escapeHtml(workout.amount)}${workout.unit ? ` ${escapeHtml(workout.unit)}` : ""}`;
        const duration = Number(workout.duration);
        return Number.isFinite(duration) && duration > 0
            ? `${amount} · ${escapeHtml(formatWorkoutDuration(duration))}`
            : amount;
    }
    const duration = Number(workout.duration);
    if (Number.isFinite(duration) && duration > 0) {
        return escapeHtml(formatWorkoutDuration(duration));
    }
    return "Workout details not recorded";
}

function formatWorkoutDuration(seconds) {
    const wholeSeconds = Math.round(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;
    if (!minutes) return `${remainingSeconds} sec`;
    return remainingSeconds ? `${minutes} min ${remainingSeconds} sec` : `${minutes} min`;
}

function safeSocialUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function safeImageUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function displayProfile({ user, workoutHistory = [] }) {
    const photo = safeImageUrl(user.profilePicture) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=181818&color=ffffff`;
    const age = Number.isInteger(user.age) ? user.age : null;
    const hasHeight = user.height !== null && user.height !== undefined &&
        String(user.height).trim() !== "";
    const hasWeight = user.weight !== null && user.weight !== undefined &&
        String(user.weight).trim() !== "";
    const profileDetails = [
        age !== null
            ? `<div class="profile-detail"><strong>${escapeHtml(age)}</strong><span>years old</span></div>`
            : "",
        hasHeight
            ? `<div class="profile-detail"><strong>${escapeHtml(user.height)}</strong><span>cm tall</span></div>`
            : "",
        hasWeight
            ? `<div class="profile-detail"><strong>${escapeHtml(user.weight)}</strong><span>kg</span></div>`
            : ""
    ].filter(Boolean).join("");
    const socialLinks = Array.isArray(user.socials)
        ? user.socials
        : Object.values(user.socials || {});
    const socials = socialLinks
        .map(value => {
            const href = safeSocialUrl(value);
            return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(href)}</a>` : "";
        })
        .filter(Boolean)
        .join("");
    const history = workoutHistory.length
        ? workoutHistory.map(workout => `
            <article class="public-workout">
                <div><strong>${escapeHtml(workout.exercise)}</strong><time>${formatWorkoutDate(workout.date)}</time></div>
                <p>${workoutDetails(workout)}</p>
            </article>
        `).join("")
        : '<p class="no-workout">No workouts recorded yet.</p>';

    profileRoot.innerHTML = `
        <header class="public-profile-header">
            <button type="button" class="public-profile-photo-button" aria-label="View profile photo">
                <img class="public-profile-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(user.name || "User")}">
            </button>
            <h2>${escapeHtml(user.name || "User")}</h2>
            <p class="profile-username">${user.username ? `@${escapeHtml(user.username)}` : ""}</p>
        </header>
        ${profileDetails ? `<p id="publicProfileIs">is</p><div class="profile-details">${profileDetails}</div>` : ""}
        ${socials ? `<section class="profile-socials"><h3>Socials</h3>${socials}</section>` : ""}
        <section class="public-workout-history">
            <h2>Workout history</h2>
            <div class="public-workout-list">${history}</div>
        </section>
    `;

    profileRoot.querySelector(".public-profile-photo-button").addEventListener("click", event => {
        publicPhotoPreview.src = event.currentTarget.querySelector("img").src;
        publicPhotoDialog.hidden = false;
        closePublicPhoto.focus();
    });
}

function closePublicPhotoDialog() {
    publicPhotoDialog.hidden = true;
    profileRoot.querySelector(".public-profile-photo-button")?.focus();
}

closePublicPhoto.addEventListener("click", closePublicPhotoDialog);
publicPhotoDialog.addEventListener("click", event => {
    if (!event.target.closest("button")) {
        closePublicPhotoDialog();
    }
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !publicPhotoDialog.hidden) {
        closePublicPhotoDialog();
    }
});

async function loadPublicProfile() {
    if (!profileToken) {
        window.location.href = "/login";
        return;
    }
    if (!profileId) {
        profileRoot.textContent = "Invalid profile.";
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/api/users/${encodeURIComponent(profileId)}`, {
            headers: { Authorization: `Bearer ${profileToken}` }
        });
        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load profile.");
        displayProfile(data);
    } catch (error) {
        console.error("Public profile error:", error);
        profileRoot.textContent = error.message || "Could not load profile.";
    }
}

loadPublicProfile();
