const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');

const languageRoutes = require("./routes/languageRoutes");
const quoteCategoryRoutes = require("./routes/quoteCategoryRoutes");
const favQuoteRoutes = require("./routes/favQuoteRoutes");
const authRoutes = require("./routes/authRoutes");
const quoteImageRoutes = require('./routes/quoteImageRoutes');
const statusRoutes = require('./routes/statusRoutes');
const userRoutes = require('./routes/userRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const redeemProductRoutes = require('./routes/redeemProductRoutes');
const pointsRoutes = require('./routes/pointsRoutes');


const app = express();

const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, auth headers)
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL parameters parsing
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// ========= Routes=============

app.use('/api/auth', authRoutes);
app.use('/api', languageRoutes);
app.use('/api', quoteCategoryRoutes);
app.use('/api', favQuoteRoutes);
app.use('/api', quoteImageRoutes);
app.use('/api', statusRoutes);
app.use('/api', userRoutes);
app.use('/api', quoteRoutes);
app.use('/api', redeemProductRoutes);
app.use('/api', pointsRoutes);

// ========= Routes end=============

app.get('/', (req, res) => {
  res.send('Hello Quotes')
})

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running successfully on ${port}`);
});