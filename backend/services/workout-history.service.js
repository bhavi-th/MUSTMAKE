const mongoose = require("mongoose");
const Workout = require("../models/Workout");

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;

function decodeCursor(value) {
    if (typeof value !== "string" || value.length > 512) {
        return null;
    }

    try {
        const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
        const createdAt = new Date(cursor.createdAt);

        if (
            typeof cursor.date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(cursor.date) ||
            Number.isNaN(createdAt.getTime()) ||
            !mongoose.isValidObjectId(cursor.id)
        ) {
            return null;
        }

        return {
            date: cursor.date,
            createdAt,
            id: new mongoose.Types.ObjectId(cursor.id)
        };
    } catch {
        return null;
    }
}

function encodeCursor(workout) {
    return Buffer.from(JSON.stringify({
        date: workout.date,
        createdAt: workout.createdAt.toISOString(),
        id: workout._id.toString()
    })).toString("base64url");
}

async function getWorkoutHistoryPage(user, query = {}) {
    const requestedLimit = Number(query.limit);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;
    const hasCursor = query.cursor !== undefined;
    const cursor = hasCursor ? decodeCursor(query.cursor) : null;

    if (hasCursor && !cursor) {
        return { invalidCursor: true };
    }

    const filter = { user };
    if (cursor) {
        filter.$or = [
            { date: { $lt: cursor.date } },
            { date: cursor.date, createdAt: { $lt: cursor.createdAt } },
            { date: cursor.date, createdAt: cursor.createdAt, _id: { $lt: cursor.id } }
        ];
    }

    const workouts = await Workout.find(filter)
        .select("exercise reps sets weight amount duration unit date createdAt")
        .sort({ date: -1, createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean();
    const hasMore = workouts.length > limit;
    if (hasMore) {
        workouts.pop();
    }
    const nextCursor = hasMore
        ? encodeCursor(workouts[workouts.length - 1])
        : null;
    const history = workouts.map(workout => {
        const fields = { ...workout };
        delete fields._id;
        delete fields.createdAt;
        return fields;
    });

    return {
        workouts: history,
        nextCursor
    };
}

module.exports = { getWorkoutHistoryPage };
