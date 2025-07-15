const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
        },
        productId: {
            type: String,
            required: true,
        },
        productCost: {
            type: Number,
            required: true,
        },

        utrNumber: {
            type: String,
            required: true,
        },
        paymentImage: {
            type: String, // Base64 encoded image
            required: true,
        },
        status: {
            type: String,
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
