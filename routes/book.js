const express = require('express');
const Book = require('../models/book');
const router = express.Router();



// Add new book
router.post('/', async (req, res) => {
    try {
        const { title, author, isbn, availableCopies } = req.body;
        const book = new Book({ title, author, isbn, availableCopies });
        await book.save();
        res.status(201).send(book);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Update book
router.put('/:id', async (req, res) => {
    try {
        const { title, author, isbn, availableCopies } = req.body;
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, isbn, availableCopies },
            { new: true, runValidators: true }
        );
        if (!book) {
            return res.status(404).send({ error: 'Book not found' });
        }
        res.send(book);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Delete book
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).send({ error: 'Book not found' });
        }
        res.send({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

module.exports = router;
