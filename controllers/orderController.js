const express = require("express");
const multer = require("multer");
const path = require("path");
const Order = require("../models/OrderModel");

const router = express.Router();

// Multer storage config for payments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "payments/"); // payments folder
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

/** ➤ CREATE Order */
router.post("/", upload.single("paymentScreenshot"), async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      phoneNumber,
      productId,
      productName,
      quantity,
      totalAmount,
      transactionId,
      status,
      productOwner,
    } = req.body;

    // Field validation
    if (
      !name ||
      !email ||
      !address ||
      !phoneNumber ||
      !productId ||
      !productName ||
      !quantity ||
      !totalAmount ||
      !transactionId ||
      !status
      || !productOwner
    ) {
      return res.status(400).json({
        error: "All fields (name, email, address, phoneNumber, productId, productName, quantity, totalAmount, transactionId, status) are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Payment screenshot is required" });
    }

    const paymentScreenshotPath = req.file.path.replace(/\\/g, "/"); // fix Windows slashes

    const newOrder = await Order.create({
      name,
      email,
      address,
      phoneNumber,
      productId,
      productName,
      quantity,
      totalAmount,
      transactionId,
      paymentScreenshot: paymentScreenshotPath,
      status,
      productOwner,

    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

/** ➤ GET All Orders */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message || "Error fetching orders" });
  }
});

/** ➤ GET Order by ID */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: error.message || "Error fetching order" });
  }
});

/** ➤ GET Orders by Email */
router.get("/email/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;

    const orders = await Order.find({ email: userEmail }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this email" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders by email:", error);
    res.status(500).json({ error: error.message || "Error fetching orders by email" });
  }
});

/** ➤ GET Orders by Product Owner Email */
router.get("/owner/:email", async (req, res) => {
  try {
    const ownerEmail = req.params.email;

    const orders = await Order.find({ productOwner: ownerEmail }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this product owner" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders by product owner email:", error);
    res.status(500).json({ error: error.message || "Error fetching orders by product owner email" });
  }
});


/** ➤ UPDATE Order Status */
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status field is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message || "Error updating order status" });
  }
});


/** ➤ DELETE Order */
router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder)
      return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: error.message || "Error deleting order" });
  }
});

module.exports = router;
