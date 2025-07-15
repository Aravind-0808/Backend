const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // assuming it references your Product model
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    paymentScreenshot: {
      type: String,
      required: true, // Because you are uploading screenshot
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending","Processing", "Confirmed", "Packed", "Shipped", "Cancelled", "Delivered"],
      default: "Pending",
    },
    productOwner: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
