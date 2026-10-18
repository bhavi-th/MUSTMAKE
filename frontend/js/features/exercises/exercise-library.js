(() => {
    "use strict";

    const exerciseGroups = [
        {
            key: "bodyweight",
            title: "Pure Yourself",
            exercises: [
                "Push-ups",
                "Pull-ups",
                "Squats",
                "Plank",
                "Jumping Jacks",
                "Skipping Rope",
                "Running",
                "Walking"
            ]
        },
        {
            key: "dumbbells",
            title: "With Dumbbells",
            exercises: [
                "Biceps Curls",
                "Shoulder Press",
                "Lateral Raises",
                "Triceps Extension"
            ]
        }
    ];

    const grid = document.getElementById("exerciseGrid");
    if (!grid) return;

    const count = document.getElementById("exerciseCount");
    const bookmarksKey = "mustmake:saved-exercises";
    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);

    const artwork = {
        "Push-ups": '<circle cx="165" cy="61" r="10"/><path d="m153 69-48 10-36 1m82-9 22 25m-70-17-14 24m-48-23 35 1-10 23m62-33 22 1 13 22M54 103h17m92-1h17"/>',
        "Pull-ups": '<path class="art-equipment" d="M70 28h100M83 28v7m74-7v7"/><circle cx="121" cy="56" r="10"/><path d="m121 66 1 32m0-27-28-39m28 39 28-39m-28 66-20 20m20-20 23 18"/>',
        "Squats": '<circle cx="120" cy="40" r="10"/><path d="m120 51-2 29m0-20-29-13m29 13 30-13m-30 33-26 12-19 23m45-35 25 13 23 22m-91 0h16m68 0h16"/>',
        "Plank": '<circle cx="169" cy="67" r="10"/><path d="m157 73-50 8-37 1m-1 0-12 23m51-24-12 24m-29 0h15m26 0h15m57-22 20 22m-7 0h14"/>',
        "Jumping Jacks": '<circle cx="120" cy="38" r="10"/><path d="m120 49 1 37m0-27L84 39m37 20 37-20m-37 27-30 33m30-33 30 33m-67 0h15m44 0h15"/>',
        "Skipping Rope": '<circle cx="130" cy="39" r="10"/><path d="m123 50-12 29 24 14 19-18m-34-20-25 4-15 22m42-24 20-5 13 11m-42 30-21 27m21-27 29 19m-54 8h16m28 0h16"/><path class="art-rope" d="M76 103c-18-52 15-76 48-75 33 1 58 28 46 75"/>',
        "Running": '<circle cx="132" cy="36" r="10"/><path d="m125 47-13 31 25 13 20-18m-35-20-26 5-15 22m43-24 21-5 14 12m-43 28-22 29m22-29 30 20m-57 9h17m28 0h17"/>',
        "Walking": '<circle cx="120" cy="36" r="10"/><path d="m120 47 1 37m0-27-21 15m21-15 20 15m-20 12-21 34m21-34 27 29m-62 5h17m37-3h16"/>',
        "Biceps Curls": '<circle cx="120" cy="36" r="10"/><path d="m120 47 1 39m0-28-28 9 8-21m20 12 28 9-8-21m-49-13-6-8m6 8 8 4m42-4 6-8m-6 8-8 4m-35 34-10 37m42-37 10 37"/>',
        "Shoulder Press": '<circle cx="120" cy="36" r="10"/><path d="m120 47 1 39m0-28-29-25m29 25 29-25m-58-5-8-8m8 8 8 8m50-8 8-8m-8 8-8 8m-40 25-13 38m40-38 13 38"/>',
        "Lateral Raises": '<circle cx="120" cy="36" r="10"/><path d="m120 47 1 39m0-28-40-1m40 1 40-1m-40 29-20 37m20-37 20 37m-69-35-9-1m9-8v16m89-8 9-1m-9-8v16"/>',
        "Triceps Extension": '<circle cx="120" cy="38" r="10"/><path d="m120 49 1 37m0-26-20-23 9-16m11 39 20-23-9-16m-40 0h12m25 0h12m-41 39-14 38m42-38 14 38m-55-1h15m41 0h15"/>'
    };

    function getBookmarks() {
        try {
            const saved = JSON.parse(localStorage.getItem(bookmarksKey) || "[]");
            return new Set(Array.isArray(saved) ? saved.filter(value => typeof value === "string") : []);
        } catch {
            return new Set();
        }
    }

    function exerciseId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    function exerciseArtwork(name, groupKey) {
        const extraArt = groupKey === "dumbbells"
            ? '<g class="art-dumbbell"><path d="M74 72h24m44 0h24M92 63v18m-8-13v8m64-13v18m8-13v8"/></g>'
            : "";
        return `<svg viewBox="0 0 240 150" role="img" aria-label="${escapeHTML(name)} illustration" focusable="false"><path class="art-orbit" d="M35 108c4-34 36-66 83-70 44-4 80 17 89 49 9 33-23 51-63 49-47-2-81 5-99-11-7-6-11-12-10-17Z"/><path class="art-ground" d="M43 124h155"/><g class="art-person" fill="none" stroke-linecap="round" stroke-linejoin="round">${artwork[name] || artwork.Squats}</g>${extraArt}<circle class="art-spark" cx="57" cy="42" r="4"/><circle class="art-spark art-spark-small" cx="195" cy="74" r="3"/></svg>`;
    }

    function renderExercise(name, group, bookmarks) {
        const id = exerciseId(name);
        const isSaved = bookmarks.has(id);
        return `
            <article class="exercise-card">
                <div class="exercise-card-media">
                    ${exerciseArtwork(name, group.key)}
                    <button class="exercise-bookmark${isSaved ? " is-saved" : ""}" type="button" data-bookmark="${id}" aria-label="${isSaved ? "Remove" : "Save"} ${escapeHTML(name)} ${isSaved ? "from" : "to"} bookmarks" aria-pressed="${isSaved}">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 4.75h10.5a1 1 0 0 1 1 1v14l-6.25-3.9-6.25 3.9v-14a1 1 0 0 1 1-1Z"/></svg>
                    </button>
                </div>
                <div class="exercise-card-content">
                    <h3>${escapeHTML(name)}</h3>
                </div>
            </article>`;
    }

    function render() {
        const bookmarks = getBookmarks();
        const total = exerciseGroups.reduce((sum, group) => sum + group.exercises.length, 0);

        if (count) count.textContent = `${total} ${total === 1 ? "exercise" : "exercises"}`;
        grid.innerHTML = exerciseGroups.map((group, index) => `
                <section class="exercise-section" aria-labelledby="exerciseGroup${index}">
                    <div class="exercise-section-heading">
                        <h2 id="exerciseGroup${index}">${escapeHTML(group.title)}</h2>
                        <span>${group.exercises.length}</span>
                    </div>
                    <div class="exercise-list exercise-grid">
                        ${group.exercises.map(name => renderExercise(name, group, bookmarks)).join("")}
                    </div>
                </section>
            `).join("");
    }

    grid.addEventListener("click", event => {
        const button = event.target.closest("[data-bookmark]");
        if (!button) return;
        const bookmarks = getBookmarks();
        const id = button.dataset.bookmark;
        if (bookmarks.has(id)) bookmarks.delete(id);
        else bookmarks.add(id);
        try {
            localStorage.setItem(bookmarksKey, JSON.stringify([...bookmarks]));
        } catch {
            // The current session still reflects the selected bookmark.
        }
        const name = [...exerciseGroups.flatMap(group => group.exercises)].find(item => exerciseId(item) === id);
        const isSaved = bookmarks.has(id);
        button.classList.toggle("is-saved", isSaved);
        button.setAttribute("aria-pressed", String(isSaved));
        button.setAttribute("aria-label", `${isSaved ? "Remove" : "Save"} ${name || "exercise"} ${isSaved ? "from" : "to"} bookmarks`);
    });

    render();
})();
