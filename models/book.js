const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    isbn: { type: String, unique: true, required: true },
    availableCopies: {
        type: Number,
        required: true,
        min: [0, 'Available copies cannot be negative'],
    },
    borrowCount: { type: Number, default: 0 },

    
});

// Validation: If book is borrowed 10+ times, available copies cannot exceed 100
bookSchema.pre('save', function (next) {
    if (this.borrowCount >= 10 && this.availableCopies > 100) {
        return next(new Error('Books borrowed 10+ times cannot have more than 100 available copies'));
    }
    next();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
