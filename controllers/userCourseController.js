const express = require("express");
const router = express.Router();
const Course = require("../models/courseModel");
const Payment = require("../models/paymentModel");

// ➤ GET: All courses bought by a user with course & payment details
router.get("/email/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const payments = await Payment.find({ userEmail: email }).sort({ createdAt: -1 });

    if (payments.length === 0) {
      return res.status(404).json({ message: "No payments found for this email" });
    }

    const result = await Promise.all(
      payments.map(async (payment) => {
        const course = await Course.findById(payment.productId);
        if (!course) return null;

        return {
          courseDetails: {
            _id: course._id,
            courseName: course.courseName,
            description: course.description,
            image: course.image,
            video: course.video,
            oldPrice: course.oldPrice,
            newPrice: course.newPrice,
          },
          paymentDetails: {
            _id: payment._id,
            status: payment.status,
            utrNumber: payment.utrNumber,
            userEmail: payment.userEmail,
            createdAt: payment.createdAt,
          }
        };
      })
    );

    const filtered = result.filter(item => item !== null);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching user courses:", error);
    res.status(500).json({ error: error.message || "Error fetching user courses" });
  }
});

module.exports = router;
