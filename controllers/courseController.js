const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Course = require("../models/courseModel");

const router = express.Router();

// ✅ Ensure the uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer disk storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ➤ CREATE Course (POST)
router.post("/", upload.fields([{ name: "image" }, { name: "video" }]), async (req, res) => {
  try {
    const { courseName, description, oldPrice, newPrice } = req.body;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (!courseName || !description || !imageFile || !videoFile || !oldPrice || !newPrice) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newCourse = await Course.create({
      courseName,
      description,
      image: imageFile.filename,
      video: videoFile.filename,
      oldPrice: Number(oldPrice),
      newPrice: Number(newPrice),
    });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ error: "Error creating course" });
  }
});

// ➤ GET All Courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("FETCH ALL ERROR:", error);
    res.status(500).json({ error: "Error fetching courses" });
  }
});

// ➤ GET Course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    res.json(course);
  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ error: "Error fetching course" });
  }
});

// ➤ UPDATE Course
router.put("/:id", upload.fields([{ name: "image" }, { name: "video" }]), async (req, res) => {
  try {
    const { courseName, description, oldPrice, newPrice } = req.body;

    const updatedData = {
      courseName,
      description,
      oldPrice: Number(oldPrice),
      newPrice: Number(newPrice),
    };

    if (req.files?.image?.[0]) {
      updatedData.image = req.files.image[0].filename;
    }

    if (req.files?.video?.[0]) {
      updatedData.video = req.files.video[0].filename;
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) return res.status(404).json({ error: "Course not found" });

    res.json(updatedCourse);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ error: "Error updating course" });
  }
});

// ➤ DELETE Course
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ error: "Course not found" });

    // Optionally delete associated files
    try {
      if (deletedCourse.image) {
        fs.unlinkSync(path.join(uploadDir, deletedCourse.image));
      }
      if (deletedCourse.video) {
        fs.unlinkSync(path.join(uploadDir, deletedCourse.video));
      }
    } catch (err) {
      console.warn("Warning: Error deleting files:", err.message);
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: "Error deleting course" });
  }
});

module.exports = router;
