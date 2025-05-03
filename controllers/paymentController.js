const express = require("express");
const multer = require("multer");
const Payment = require("../models/paymentModel");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ➤ CREATE Payment
router.post("/", upload.single("paymentImage"), async (req, res) => {
  try {
    const { userEmail, productId, productCost, utrNumber } = req.body;
    const paymentImage = req.file ? req.file.buffer.toString("base64") : null;

    // Validation
    if (!userEmail || !productId || !productCost || !utrNumber || !paymentImage) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPayment = await Payment.create({
      userEmail,
      productId,
      productCost,
      utrNumber,
      paymentImage,
      status: "Pending",
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: error.message || "Error saving payment" });
  }
});

// ➤ GET All Payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: error.message || "Error fetching payments" });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const payments = await Payment.find({ userEmail: email }).sort({ createdAt: -1 });

    if (payments.length === 0) {
      return res.status(404).json({ message: "No payments found for this email" });
    }

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments by email:", error);
    res.status(500).json({ error: error.message || "Error fetching payments" });
  }
});


// ➤ GET Payment by ID
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: error.message || "Error fetching payment" });
  }
});

// ➤ UPDATE Payment
router.put("/:id", upload.single("paymentImage"), async (req, res) => {
  try {
    const { userEmail, productId, productCost, utrNumber, status } = req.body;

    const updatedData = {};
    if (userEmail) updatedData.userEmail = userEmail;
    if (productId) updatedData.productId = productId;
    if (productCost) updatedData.productCost = productCost;
    if (utrNumber) updatedData.utrNumber = utrNumber;
    if (status) updatedData.status = status;

    if (req.file) {
      updatedData.paymentImage = req.file.buffer.toString("base64");
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedPayment)
      return res.status(404).json({ error: "Payment not found" });

    res.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ error: error.message || "Error updating payment" });
  }
});

// ➤ DELETE Payment
router.delete("/:id", async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment)
      return res.status(404).json({ error: "Payment not found" });

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: error.message || "Error deleting payment" });
  }
});

module.exports = router;
