const mongoose = require('mongoose');

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

// Validation: Borrower can borrow a maximum of 5 books for standard members, 10 for premium members
borrowerSchema.methods.canBorrow = function () {
    const limit = this.membershipType === 'premium' ? 10 : 5;
    return this.borrowedBooks.length < limit;
};

const Borrower = mongoose.model('Borrower', borrowerSchema);
module.exports = Borrower;
