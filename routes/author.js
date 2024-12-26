const express = require('express');
const Author = require('../models/author');
const router = express.Router();

// Add new author
router.post('/', async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const author = new Author({ name, email, phoneNumber });
        await author.save();
        res.status(201).send(author);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Update author
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const author = await Author.findByIdAndUpdate(
            req.params.id,
            { name, email, phoneNumber },
            { new: true, runValidators: true }
        );
        if (!author) {
            return res.status(404).send({ error: 'Author not found' });
        }
        res.send(author);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Delete author
router.delete('/:id', async (req, res) => {
    try {
        const author = await Author.findByIdAndDelete(req.params.id);
        if (!author) {
            return res.status(404).send({ error: 'Author not found' });
        }
        res.send({ message: 'Author deleted successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

module.exports = router;
