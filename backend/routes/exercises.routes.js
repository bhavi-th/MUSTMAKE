const express = require("express");
const exercises = require("../config/exercises.json");

const router = express.Router();

router.get("/api/exercises", (req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json(exercises);
});

module.exports = router;
