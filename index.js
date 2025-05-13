require("dotenv").config();  // Load environment variables

const express = require("express");
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
var cron = require('node-cron');
const client = new MongoClient(MONGO_URI);
let db;

app.use(cors({
  origin: '*', // Allows all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specifies allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specifies allowed headers
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or specific domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


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
        const sectionData =  section.subjects.map(subject => ({
                subjectName: subject.name,
                board: subject.board,
                
            }));
        

        res.json(sectionData);  // Return the section data in the response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/grades/:gradeId/sections/:sectionName/subjects/:subjectBoard/:subjectName", async (req, res) => {
    const { gradeId, sectionName, subjectBoard, subjectName } = req.params; // Extracting parameters from the URL

    try {
        // Ensure gradeId is a valid ObjectId
        const grade = await db.collection("lesson_script").findOne({ "_id": new ObjectId(gradeId) });

        if (!grade) {
            return res.status(404).json({ message: "Grade not found" });
        }

        // Find the section within the grade document
        const section = grade.sections.find(sec => sec.section === sectionName);

        if (!section) {
            return res.status(404).json({ message: `Section '${sectionName}' not found` });
        }

        // Find the subject within the section
        const subject = section.subjects.find(
            subj => subj.name === subjectName && subj.board === subjectBoard
        );

        if (!subject) {
            return res.status(404).json({ message: `Subject '${subjectName}' with board '${subjectBoard}' not found` });
        }

        // Respond with only the chapters
        res.json(subject.chapters || []); // Return chapters or an empty array if none exist

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/grades/:gradeId/sections/:sectionName/subjects/:subjectBoard/:subjectName/chapters/:chapterName/periods", async (req, res) => {
    const { gradeId, sectionName, subjectBoard, subjectName, chapterName } = req.params;
    
    try {
        // Decode the chapter name (handles spaces and special characters)
        const decodedChapterName = decodeURIComponent(chapterName);

        const grade = await db.collection("lesson_script").findOne({ "_id": new ObjectId(gradeId) });

        if (!grade) {
            return res.status(404).json({ message: "Grade not found" });
        }

        const section = grade.sections.find(sec => sec.section === sectionName);
        if (!section) {
            return res.status(404).json({ message: `Section '${sectionName}' not found` });
        }

        const subject = section.subjects.find(subj => subj.name === subjectName && subj.board === subjectBoard);
        if (!subject) {
            return res.status(404).json({ message: `Subject '${subjectName}' with board '${subjectBoard}' not found` });
        }

        const chapter = subject.chapters.find(chap => chap.name === decodedChapterName);
        if (!chapter) {
            return res.status(404).json({ message: `Chapter '${decodedChapterName}' not found` });
        }

        // Respond with periods for the found chapter
        res.json(chapter.periods || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


cron.schedule('*/10 * * * *', function() {
    axios.get("https://backend-jpaq.onrender.com")
      .then(function (response) {
        console.log('Self ping successful');
      })
      .catch(function (error) {
        console.log('Self ping failed: ', error);
      });
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
