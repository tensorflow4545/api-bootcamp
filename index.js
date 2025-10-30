// ---------------------------
// 📘 NOTES API with MongoDB
// Technologies: Node.js, Express.js, Mongoose, CORS
// ---------------------------

// 1. Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// 2. Initialize Express app
const app = express();

// 3. Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies

// 4. Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://anshulojha1214:anshulojha@cluster0.e0a7mlr.mongodb.net/";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// 5. Define Mongoose Schema & Model
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Middleware: update 'updatedAt' before saving
noteSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Note = mongoose.model("Note", noteSchema);

// 6. Routes

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Notes API 🚀");
});

// GET /notes → fetch all notes
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching notes" });
  }
});

// POST /notes → create new note
app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newNote = new Note({ title, content });
    await newNote.save();

    res
      .status(201)
      .json({ message: "Note created successfully", note: newNote });
  } catch (err) {
    res.status(500).json({ message: "Error creating note" });
  }
});

// PUT /notes/:id → update note
app.put("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    note.updatedAt = Date.now();

    await note.save();
    res.json({ message: "Note updated successfully", note });
  } catch (err) {
    res.status(500).json({ message: "Error updating note" });
  }
});

// DELETE /notes/:id → delete note
app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByIdAndDelete(id);

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
});

// 7. Global Error Handling (Fallback)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// 8. Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
