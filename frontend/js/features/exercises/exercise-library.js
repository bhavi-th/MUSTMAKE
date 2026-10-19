
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

    const exerciseMedia = {
        "Push-ups": {
            src: "/assets/images/pushups.mp4",
            type: "video"
        },
        "Pull-ups": {
            src: "/assets/images/pullups.mp4",
            type: "video"
        },
        "Squats": {
            src: "/assets/images/squats.mp4",
            type: "video"
        },
        "Plank": {
            src: "/assets/images/plank.jpeg",
            type: "image"
        },
        "Jumping Jacks": {
            src: "/assets/images/jumping_jacks.mp4",
            type: "video"
        },
        "Skipping Rope": {
            src: "/assets/images/skipping.mp4",
            type: "video"
        },
        "Running": {
            src: "/assets/images/running.mp4",
            type: "video"
        },
        "Walking": {
            src: "/assets/images/walking.mp4",
            type: "video"
        },
        "Biceps Curls": {
            src: "/assets/images/bicepcurl.mp4",
            type: "video"
        },
        "Shoulder Press": {
            src: "/assets/images/Shoulder_press.mp4",
            type: "video"
        },
        "Lateral Raises": {
            src: "/assets/images/lateral_raises.mp4",
            type: "video"
        },
        "Triceps Extension": {
            src: "/assets/images/tricep_extension.mp4",
            type: "video"
        }
    };

    const grid = document.getElementById("exerciseGrid");
    if (!grid) return;

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    function renderExerciseMedia(name) {
        const media = exerciseMedia[name];

        if (!media) return "";

        if (media.type === "image") {
            return `
                <img
                    class="exercise-media"
                    src="${media.src}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                >
            `;
        }

        return `
            <video
                class="exercise-media exercise-demo"
                muted
                loop
                playsinline
                preload="none"
                aria-label="${escapeHTML(name)} demonstration"
            >
                <source src="${media.src}" type="video/mp4">
            </video>
        `;
    }

    // Play visible videos and pause videos outside the viewport.
    const exerciseVideoObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                const video = entry.target;

                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        },
        {
            threshold: 0.4
        }
    );

    function observeExerciseVideos(root = grid) {
        root.querySelectorAll(".exercise-demo:not([data-observed])")
            .forEach(video => {
                video.dataset.observed = "true";
                exerciseVideoObserver.observe(video);
            });
    }

    function renderExercise(name) {
        return `
            <article class="exercise-card">
                <div class="exercise-card-media">
                    ${renderExerciseMedia(name)}
                </div>

                <div class="exercise-card-content">
                    <h3>${escapeHTML(name)}</h3>
                </div>
            </article>
        `;
    }

    function render() {
        grid.innerHTML = exerciseGroups.map((group, index) => `
            <section
                class="exercise-section"
                aria-labelledby="exerciseGroup${index}"
            >
                <div class="exercise-section-heading">
                    <h2 id="exerciseGroup${index}">
                        ${escapeHTML(group.title)}
                    </h2>
                </div>

                <div class="exercise-list exercise-grid">
                    ${group.exercises
                        .map(renderExercise)
                        .join("")}
                </div>
            </section>
        `).join("");

        observeExerciseVideos(grid);
    }

    render();
})();
