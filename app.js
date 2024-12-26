const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authorRoutes = require('./routes/author');
const bookRoutes = require('./routes/book');
const borrowerRoutes = require('./routes/borrower');

const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/library_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Author Schema
const authorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: 'Invalid email format',
        },
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: (v) => /^[0-9]{10}$/.test(v),
            message: 'Invalid phone number format',
        },
    },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

// Constraint: Author can only be linked to 5 books
authorSchema.pre('save', function (next) {
    if (this.books.length > 5) {
        return next(new Error('An author cannot be linked to more than 5 books'));
    }
    next();
});

// Check if the model already exists before defining it
const Author = mongoose.models.Author || mongoose.model('Author', authorSchema);

// Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    isbn: { type: String, unique: true, required: true },
    availableCopies: {
        type: Number,
        required: true,
        min: [0, 'Available copies cannot be negative'],
    },
    borrowCount: { type: Number, default: 0 }, // Tracks the number of times the book is borrowed
});

// Constraint: If book is borrowed 10+ times, available copies cannot exceed 100
bookSchema.pre('save', function (next) {
    if (this.borrowCount >= 10 && this.availableCopies > 100) {
        return next(new Error('Books borrowed 10+ times cannot have more than 100 available copies'));
    }
    next();
});

// Check if the model already exists before defining it
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

// Borrower Schema
const borrowerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    membershipActive: { type: Boolean, required: true },
    membershipType: {
        type: String,
        enum: ['standard', 'premium'],
        required: true,
    },
});

// Constraint: Borrow limit based on membership type
borrowerSchema.methods.canBorrow = function () {
    const limit = this.membershipType === 'premium' ? 10 : 5;
    return this.borrowedBooks.length < limit;
};

// Check if the model already exists before defining it
const Borrower = mongoose.models.Borrower || mongoose.model('Borrower', borrowerSchema);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send({ error: err.message });
});

// Import routes
app.use('/book', bookRoutes);
app.use('/author', authorRoutes);
app.use('/borrower', borrowerRoutes);

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Library Management System running on port ${PORT}`);
});
