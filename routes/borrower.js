const express = require('express');
const Borrower = require('../models/borrower');
const Book = require('../models/book');
const router = express.Router();

// Add new borrower
router.post('/', async (req, res) => {
    try {
        const { name, membershipActive, membershipType } = req.body;
        const borrower = new Borrower({ name, membershipActive, membershipType });
        await borrower.save();
        res.status(201).send(borrower);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Borrow book
router.post('/:borrowerId/borrow/:bookId', async (req, res) => {
    try {
        const borrower = await Borrower.findById(req.params.borrowerId);
        const book = await Book.findById(req.params.bookId);

        if (!book || book.availableCopies <= 0) {
            return res.status(400).send({ error: 'No available copies left' });
        }

        if (!borrower.canBorrow()) {
            return res.status(400).send({ error: 'Borrower has reached borrowing limit' });
        }

        borrower.borrowedBooks.push(book._id);
        book.availableCopies -= 1;
        book.borrowCount += 1;

        await borrower.save();
        await book.save();

        res.send({ message: 'Book borrowed successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Return book
router.post('/:borrowerId/return/:bookId', async (req, res) => {
    try {
        const borrower = await Borrower.findById(req.params.borrowerId);
        const book = await Book.findById(req.params.bookId);

        borrower.borrowedBooks.pull(book._id);
        book.availableCopies += 1;

        await borrower.save();
        await book.save();

        res.send({ message: 'Book returned successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

module.exports = router;
