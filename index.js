require("dotenv").config();  // Load environment variables

const express = require("express");
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const client = new MongoClient(MONGO_URI);
let db;

client.connect().then(() => {
    db = client.db("flashcard_game");
    console.log("Connected to MongoDB");
});

app.get("/", (req, res) => {
    res.send("API is running!");
});

// ✅ API to fetch all grades
app.get("/grades", async (req, res) => {
    try {
        const grades = await db.collection("lesson_script").find().toArray();
        res.json(grades.map(grade => ({
            id: grade._id,
            grade: grade.grade
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ API to fetch sections for a specific grade
app.get("/grades/:gradeId/sections", async (req, res) => {
    const { gradeId } = req.params;  // Extract the gradeId from the URL parameters
    try {
        // Ensure gradeId is passed as a valid string representing ObjectId
        const grade = await db.collection("lesson_script").findOne({ "_id": new ObjectId(gradeId) });

        if (!grade) {
            return res.status(404).json({ message: "Grade not found" });
        }

        // Extract the sections from the grade document
        const sections = grade.sections || [];

        if (sections.length === 0) {
            return res.status(404).json({ message: "No sections found for this grade" });
        }

        // Respond with the sections data
        const sectionData = sections.map(section => ({
            sectionName: section.section,
        }));

        res.json(sectionData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/grades/:gradeId/sections/:sectionName", async (req, res) => {
    const { gradeId, sectionName } = req.params;  // Extract gradeId and sectionName from the URL parameters
    try {
        // Ensure gradeId is passed as a valid string representing ObjectId
        const grade = await db.collection("lesson_script").findOne({ "_id": new ObjectId(gradeId) });

        if (!grade) {
            return res.status(404).json({ message: "Grade not found" });
        }

        // Find the section within the grade document that matches the sectionName
        const section = grade.sections.find(sec => sec.section === sectionName);

        if (!section) {
            return res.status(404).json({ message: `Section '${sectionName}' not found for this grade` });
        }

        // Respond with the section data (you can add more data depending on your structure)
        const sectionData = {
            sectionName: section.section,
            subjects: section.subjects.map(subject => ({
                subjectName: subject.name,
                board: subject.board,
                chapters: subject.chapters.map(chapter => ({
                    chapterName: chapter.name,
                    periods: chapter.periods.map(period => ({
                        period: period.period,
                        script: period.script
                    }))
                }))
            }))
        };

        res.json(sectionData);  // Return the section data in the response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
