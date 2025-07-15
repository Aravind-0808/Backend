const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/ProductModel");

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
  },
});

/** ➤ CREATE Product */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      originalPrice,
      offerPercentage,
      sold,
      stock,
      highlights,
      service,
      description,
      uploadedBy
    } = req.body;

    // Field validation
    if (!name || !originalPrice || !stock || !description || !highlights || !service || !uploadedBy) {
      return res.status(400).json({
        error: "All fields (name, originalPrice, stock, description, highlights, service,uploadedBy) are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Product image is required" });
    }

    const imagePath = req.file.path.replace(/\\/g, "/"); // IMPORTANT: Fix Windows slashes

    const newProduct = await Product.create({
      name,
      originalPrice,
      offerPercentage,
      sold,
      stock,
      highlights,
      service,
      description,
      uploadedBy,
      image: imagePath,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

/** ➤ GET All Products */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message || "Error fetching products" });
  }
});

/** ➤ GET Product by ID */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message || "Error fetching product" });
  }
});

/** ➤ GET Products by uploadedBy (email) */
router.get("/uploadedBy/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const products = await Product.find({ uploadedBy: userEmail }).sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(404).json({ error: "No products found for this user" });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by uploadedBy:", error);
    res.status(500).json({ error: error.message || "Error fetching products" });
  }
});


/** ➤ UPDATE Product */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/"); // Fix Windows slashes here also
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message || "Error updating product" });
  }
});

/** ➤ DELETE Product */
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "Error deleting product" });
  }
});

module.exports = router;
