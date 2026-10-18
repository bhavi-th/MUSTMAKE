function getToken() {
    return localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
}

const profilePictureInput = document.getElementById("profilePicture");
const photoPreview = document.getElementById("photoPreview");
const ageInput = document.getElementById("age");
const deleteAccountButton = document.getElementById("deleteAccountButton");
const deleteAccountMessage = document.getElementById("deleteAccountMessage");

profilePictureInput.addEventListener("change", () => {
    const file = profilePictureInput.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        alert("Please select a JPG, PNG or WebP image.");
        profilePictureInput.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("Profile photo must be smaller than 2 MB.");
        profilePictureInput.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = event => {
        photoPreview.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

async function loadProfile() {
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

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Could not load profile.");
        }

        const user = data.user;

        ageInput.value = user.age ?? "";

        document.getElementById("height").value = user.height || "";
        document.getElementById("weight").value = user.weight || "";

        if (user.profilePicture) {
            photoPreview.src = user.profilePicture;
        } else {
            photoPreview.src =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(user.name) +
                "&size=200";
        }

        if (user.socials) {
            document.getElementById("instagram").value = user.socials.instagram || "";
            document.getElementById("youtube").value = user.socials.youtube || "";
            document.getElementById("github").value = user.socials.github || "";
            document.getElementById("x").value = user.socials.x || "";
        }
    } catch (error) {
        console.error(error);
        document.getElementById("profileMessage").textContent = error.message;
    }
}

const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", async event => {
    event.preventDefault();

    const message = document.getElementById("profileMessage");
    message.textContent = "Saving...";

    try {
        const payload = {
            age: ageInput.value,
            height: document.getElementById("height").value,
            weight: document.getElementById("weight").value,
            socials: {
                instagram: document.getElementById("instagram").value.trim(),
                youtube: document.getElementById("youtube").value.trim(),
                github: document.getElementById("github").value.trim(),
                x: document.getElementById("x").value.trim()
            }
        };

        const selectedPhoto = profilePictureInput.files?.[0];
        if (selectedPhoto) {
            payload.profilePicture = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(selectedPhoto);
            });
        }

        const response = await fetch(`${window.API_URL}/api/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || "Could not save profile.");
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        message.textContent = "Profile saved successfully.";

        setTimeout(() => {
            window.location.href = "/today";
        }, 700);
    } catch (error) {
        console.error(error);
        message.textContent = error.message;
    }
});

if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", async () => {
        const confirmed = window.confirm(
            "Delete your account permanently? This will also delete your profile, workouts, and competition links. This action cannot be undone."
        );
        if (!confirmed) return;

        const saveButton = profileForm.querySelector('button[type="submit"]');
        deleteAccountButton.disabled = true;
        if (saveButton) saveButton.disabled = true;
        deleteAccountMessage.textContent = "Deleting your account...";

        try {
            const response = await fetch(`${window.API_URL}/api/account`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });
            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                logout();
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
            console.error(error);
            deleteAccountMessage.textContent = error instanceof TypeError
                ? "Could not reach the server. Please try again."
                : error.message || "Could not delete your account.";
            deleteAccountButton.disabled = false;
            if (saveButton) saveButton.disabled = false;
        }
    });
}

loadProfile();
