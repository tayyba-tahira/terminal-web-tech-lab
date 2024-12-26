const mongoose = require('mongoose');



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

// Validation: Author can only be linked to 5 books
authorSchema.pre('save', function (next) {
    if (this.books.length > 5) {
        return next(new Error('An author cannot be linked to more than 5 books'));
    }
    next();
});

const Author = mongoose.model('Author', authorSchema);
module.exports = Author;
