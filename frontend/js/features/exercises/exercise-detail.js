(() => {
    "use strict";

    const root = document.getElementById("exerciseDetail");
    const slug = document.body.dataset.exerciseSlug;
    if (!root || !slug) return;

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    function cacheExercises(exercises) {
        try {
            sessionStorage.setItem("mustmake_exercises", JSON.stringify(exercises));
        } catch (error) {
            console.warn("Could not cache the exercise catalog.", error);
        }
    }

function renderMedia(exercise) {
    const media = exercise.media;
    if (!media) return "";

    if (media.type === "image") {
        return `
            <img
                class="exercise-media"
                src="${escapeHTML(media.src)}"
                alt="${escapeHTML(exercise.name)} demonstration"
                loading="lazy"
            >
        `;
    }

    return `
        <video
            class="exercise-media exercise-demo"
            autoplay
            muted
            loop
            playsinline
            disablepictureinpicture
            controlslist="nodownload noplaybackrate noremoteplayback"
            preload="metadata"
            aria-label="${escapeHTML(exercise.name)} demonstration"
        >
            <source
                src="${escapeHTML(media.src)}"
                type="video/mp4"
            >
        </video>
    `;
}

    function renderField(field) {
        const id = `workout-${field.name}`;
        return `
            <div class="exercise-form-field">
                <label for="${escapeHTML(id)}">${escapeHTML(field.label)}</label>
                <input
                    id="${escapeHTML(id)}"
                    name="${escapeHTML(field.name)}"
                    type="number"
                    min="${escapeHTML(field.min)}"
                    step="${escapeHTML(field.step)}"
                    inputmode="decimal"
                    required
                >
            </div>
        `;
    }

    function renderManualMode(exercise) {
        return `
            <div class="exercise-mode-content">
                <div class="exercise-mode-intro">
                    
                </div>
                <form id="manualWorkoutForm" class="exercise-workout-form">
                    <div class="exercise-form-grid">
                        ${exercise.fields.map(renderField).join("")}
                    </div>
                    <p id="exerciseFormMessage" class="exercise-form-message" role="status" aria-live="polite"></p>
                    <button class="main-button exercise-done-button" type="submit">Done</button>
                </form>
            </div>
        `;
    }

    function renderAiMode() {
        return `
            <p>Still in development , sorry for any inconvenience caused</p>
        `;
    }

    function render(exercise) {
        const supportedModes = Array.isArray(exercise.modes)
            ? exercise.modes.filter(mode => mode === "ai" || mode === "manual")
            : ["manual"];
        const hasAiMode = supportedModes.includes("ai");
        const hasManualMode = supportedModes.includes("manual");
        const selectedMode = hasManualMode ? "manual" : hasAiMode ? "ai" : null;
        const modeLabel = mode => mode === "ai" ? "AI Mode" : "Manual Entry";
        const modeButtons = supportedModes.length > 1
            ? `
                <div class="exercise-mode-tabs" role="tablist" aria-label="Workout mode">
                    ${supportedModes.map(mode => `
                        <button type="button" role="tab" id="${mode}ModeTab" tabindex="${mode === selectedMode ? "0" : "-1"}" aria-selected="${mode === selectedMode}" aria-controls="exerciseModeContent" data-exercise-mode="${mode}">${modeLabel(mode)}</button>
                    `).join("")}
                </div>
            `
            : "";

        const initialModeContent = selectedMode === "ai"
            ? renderAiMode()
            : selectedMode === "manual"
                ? renderManualMode(exercise)
                : '<p class="no-workout">No workout modes are configured for this exercise.</p>';
        const panelAttributes = supportedModes.length > 1
            ? `role="tabpanel" aria-labelledby="${selectedMode}ModeTab" tabindex="0"`
            : selectedMode
                ? `aria-labelledby="${selectedMode === "ai" ? "aiModeTitle" : "exerciseModeTitle"}"`
                : "";

        document.title = `${exercise.name} | MUSTMAKE`;
        root.innerHTML = `
            <header class="exercise-detail-heading">
                <h1>${escapeHTML(exercise.name)}</h1>
            </header>
            <div class="exercise-detail-layout">
                <section class="exercise-demo-panel" aria-label="Exercise demonstration">
                    ${renderMedia(exercise)}
                </section>
                <section class="exercise-workout-panel" aria-label="Workout modes">
                    ${modeButtons}
                    <div id="exerciseModeContent" class="exercise-mode-panel" ${panelAttributes}>
                        ${initialModeContent}
                    </div>
                </section>
            </div>
        `;

        const modeContent = root.querySelector("#exerciseModeContent");
        const tabs = [...root.querySelectorAll("[data-exercise-mode]")];
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(item => {
                    const selected = item === tab;
                    item.setAttribute("aria-selected", String(selected));
                    item.tabIndex = selected ? 0 : -1;
                });
                const mode = tab.dataset.exerciseMode;
                modeContent.setAttribute("aria-labelledby", mode === "ai" ? "aiModeTab" : "manualModeTab");
                modeContent.innerHTML = mode === "ai" ? renderAiMode() : renderManualMode(exercise);
                bindManualForm(exercise);
            });

            tab.addEventListener("keydown", event => {
                if (!tabs.length) return;
                let nextIndex = tabs.indexOf(tab);
                if (event.key === "ArrowRight") nextIndex = (nextIndex + 1) % tabs.length;
                else if (event.key === "ArrowLeft") nextIndex = (nextIndex - 1 + tabs.length) % tabs.length;
                else if (event.key === "Home") nextIndex = 0;
                else if (event.key === "End") nextIndex = tabs.length - 1;
                else return;

                event.preventDefault();
                tabs[nextIndex].focus();
                tabs[nextIndex].click();
            });
        });

        if (selectedMode === "manual") bindManualForm(exercise);
    }

    function buildWorkoutPayload(exercise, form) {
        const values = new FormData(form);
        const payload = { exercise: exercise.name };

        exercise.fields.forEach(field => {
            const value = Number(values.get(field.name));
            if (field.name === "durationMinutes") {
                payload.duration = Math.round(value * 60);
            } else {
                payload[field.name] = value;
            }
        });

        if (exercise.manualType === "distance-duration") payload.unit = "km";
        if (exercise.manualType === "jumps-duration") payload.unit = "jumps";
        return payload;
    }

    function bindManualForm(exercise) {
        const form = root.querySelector("#manualWorkoutForm");
        if (!form) return;

        form.addEventListener("submit", async event => {
            event.preventDefault();
            const message = root.querySelector("#exerciseFormMessage");
            const button = form.querySelector("button[type='submit']");
            const token = localStorage.getItem("token");

            if (!token) {
                message.innerHTML = 'Please <a href="/login">sign in</a> to save your workout.';
                return;
            }

            button.disabled = true;
            button.textContent = "Saving…";
            message.textContent = "Saving your workout…";

            try {
                const response = await fetch(`${window.API_URL}/api/workouts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(buildWorkoutPayload(exercise, form))
                });
                const data = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    message.innerHTML = 'Your session expired. Please <a href="/login">sign in</a> again.';
                    return;
                }
                if (!response.ok) {
                    message.textContent = data.message || "Could not save this workout. Check the values and try again.";
                    return;
                }

                form.reset();
                message.innerHTML = 'Workout saved. <a href="/today">View today</a> or <a href="/history">open history</a>.';
            } catch (error) {
                console.error("Save workout error:", error);
                message.textContent = "Could not connect to the server. Please try again.";
            } finally {
                button.disabled = false;
                button.textContent = "Done";
            }
        });
    }

    async function loadExercises() {
        let cachedExercises;
        try {
            cachedExercises = JSON.parse(sessionStorage.getItem("mustmake_exercises") || "null");
        } catch (error) {
            console.warn("Could not read the cached exercise catalog.", error);
        }
        if (Array.isArray(cachedExercises)) return cachedExercises;

        let catalogError;
        try {
            const response = await fetch("/data/exercises.json");
            if (!response.ok) throw new Error(`Exercise catalog returned ${response.status}.`);
            const exercises = await response.json();
            if (!Array.isArray(exercises)) throw new Error("Exercise catalog returned invalid data.");
            cacheExercises(exercises);
            return exercises;
        } catch (error) {
            catalogError = error;
        }

        try {
            const response = await fetch(`${window.API_URL}/api/exercises`);
            if (!response.ok) throw new Error(`Exercise API returned ${response.status}.`);
            const exercises = await response.json();
            if (!Array.isArray(exercises)) throw new Error("Exercise API returned an invalid catalog.");
            cacheExercises(exercises);
            return exercises;
        } catch (apiError) {
            console.error("Exercise catalog fallback failed:", catalogError);
            throw apiError;
        }
    }

    async function loadExercise() {
        try {
            const exercises = await loadExercises();
            const exercise = exercises.find(item => item.slug === slug);
            if (!exercise) throw new Error("This exercise could not be found.");
            render(exercise);
        } catch (error) {
            console.error("Exercise detail error:", error);
            root.innerHTML = `
                <a class="exercise-back-link" href="/today">&larr; Back to exercises</a>
                <p class="no-workout">${escapeHTML(error.message || "This exercise could not be loaded.")}</p>
            `;
        }
    }

    loadExercise();
})();
