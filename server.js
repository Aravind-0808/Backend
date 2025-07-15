const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require("path");

const userController = require('./controllers/userController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const contactController = require('./controllers/contactController');


dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());

// ✅ Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Mount routers
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/payments", express.static(path.join(__dirname, "payments")));
app.use("/qrcode", express.static(path.join(__dirname, "qrcode")));
app.use('/api/users', userController); 
app.use('/api/products', productController);
app.use('/api/orders', orderController);
app.use('/api/contacts', contactController);





app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
