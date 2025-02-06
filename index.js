const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb+srv://pupiltreechatgpt:Pupiltree123@cluster0.w20cc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";  // Replace with actual MongoDB URL

const client = new MongoClient(MONGO_URI);
let db;

client.connect().then(() => {
    db = client.db("flashcard_game");
    console.log("Connected to MongoDB");
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

// ✅ API to fetch sections for a selected grade
app.get("/sections/:grade", async (req, res) => {
    try {
        const grade = parseInt(req.params.grade);
        const result = await db.collection("lesson_script").findOne({ grade });
        if (result) {
            res.json(result.sections.map(section => ({
                section: section.section
            })));
        } else {
            res.status(404).json({ error: "Grade not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ API to fetch subjects for a selected section
app.get("/subjects/:grade/:section", async (req, res) => {
    try {
        const grade = parseInt(req.params.grade);
        const sectionName = req.params.section;

        const result = await db.collection("lesson_script").findOne({ grade });
        if (result) {
            const section = result.sections.find(s => s.section === sectionName);
            if (section) {
                res.json(section.subjects.map(subject => ({
                    name: subject.name,
                    board: subject.board
                })));
            } else {
                res.status(404).json({ error: "Section not found" });
            }
        } else {
            res.status(404).json({ error: "Grade not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ API to fetch chapters for a selected subject
app.get("/chapters/:grade/:section/:subject", async (req, res) => {
    try {
        const grade = parseInt(req.params.grade);
        const sectionName = req.params.section;
        const subjectName = req.params.subject;

        const result = await db.collection("lesson_script").findOne({ grade });
        if (result) {
            const section = result.sections.find(s => s.section === sectionName);
            if (section) {
                const subject = section.subjects.find(sub => sub.name === subjectName);
                if (subject) {
                    res.json(subject.chapters.map(chapter => ({
                        name: chapter.name
                    })));
                } else {
                    res.status(404).json({ error: "Subject not found" });
                }
            } else {
                res.status(404).json({ error: "Section not found" });
            }
        } else {
            res.status(404).json({ error: "Grade not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
