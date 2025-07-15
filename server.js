const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const userController = require('./controllers/userController'); // Should also be a router
const courseRoutes = require('./controllers/courseController');
const paymentRoutes = require('./controllers/paymentController'); 
const contactRoutes = require('./controllers/contactController');
const userCourseRoutes = require('./controllers/userCourseController'); 

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());

// ✅ Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Mount routers
app.use('/api/users', userController); 
app.use('/api/courses', courseRoutes);
app.use("/uploads", express.static("uploads"));
app.use('/api/payments', paymentRoutes); 
app.use('/api/contacts', contactRoutes); 
app.use('/api/userCourses', userCourseRoutes);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
