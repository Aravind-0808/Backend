const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  offerPercentage: { type: Number, required: true },
  image: { type: String, required: true }, // store image path or URL
  sold: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  highlights: [{ type: String }],
  service: [{ type: String }],
  description: { type: String },
  uploadedBy: { type: String, required: true },
  

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
