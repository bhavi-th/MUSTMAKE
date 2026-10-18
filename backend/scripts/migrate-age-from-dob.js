const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const { getDateString } = require("../utils/date");

function ageFromDateOfBirth(value, today) {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) return null;

    const [birthYear, birthMonth, birthDay] = date.toISOString().slice(0, 10).split("-").map(Number);
    const [currentYear, currentMonth, currentDay] = today.split("-").map(Number);

    let age = currentYear - birthYear;
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) age--;
    return Number.isInteger(age) && age >= 0 && age <= 120 ? age : null;
}

async function migrate() {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing.");

    await mongoose.connect(process.env.MONGO_URI);
    const users = mongoose.connection.collection("users");
    const today = getDateString();
    const currentYear = Number(today.slice(0, 4));
    const cursor = users.find({
        $or: [
            { dateOfBirth: { $exists: true } },
            { age: { $exists: true }, ageReferenceYear: { $in: [null] } }
        ]
    }).project({ dateOfBirth: 1, age: 1, ageReferenceYear: 1 });
    let operations = [];
    let migrated = 0;

    for await (const user of cursor) {
        const hasSavedAge = Number.isInteger(user.age) && user.age >= 0 && user.age <= 120;
        const age = hasSavedAge ? user.age : ageFromDateOfBirth(user.dateOfBirth, today);
        operations.push({
            updateOne: {
                filter: { _id: user._id },
                update: {
                    $set: {
                        age,
                        ageReferenceYear: age === null
                            ? null
                            : hasSavedAge && Number.isInteger(user.ageReferenceYear)
                                ? user.ageReferenceYear
                                : currentYear
                    },
                    $unset: { dateOfBirth: "" }
                }
            }
        });

        if (operations.length === 500) {
            const result = await users.bulkWrite(operations, { ordered: false });
            migrated += result.modifiedCount;
            operations = [];
        }
    }

    if (operations.length) {
        const result = await users.bulkWrite(operations, { ordered: false });
        migrated += result.modifiedCount;
    }

    console.log(`Migrated ${migrated} user records and removed stored dates of birth.`);
}

migrate()
    .catch(error => {
        console.error("Age migration failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
