const express = require('express');
const router = express.Router();

const Review = require('../models/review');

router.post('/add', async (req, res) => {
    if (!req.session.loggedIn)
        return res.sendStatus(404);

    let reviewExists = await Review.findOne({ authorId: req.session.user._id, movieId: req.body.movieId });

    if (reviewExists != null)
    {
        req.session.alert = {type: 'error', message: "You already reviewed this movie!"};

        return res.redirect('/');
    }

    Review
    .create({
        text: req.body.text,
        rating: req.body.rating,
        movieId: req.body.movieId,
        authorId: req.session.user._id
    })
    .then(() => {
        req.session.alert = {type: 'success', message: "Review added!"};

        return res.redirect('/');
    })
    .catch(e => {
        req.session.alert = {type: 'error', message: e.message};

        return res.redirect('/');
    })
});

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;

    Review
    .findById(id)
    .then(async r => {
        if (r.authorId.toString() != req.session.user._id)
            return res.sendStatus(404);

        await r.delete();

        req.session.alert = {type: 'success', message: "Review deleted!"};

        return res.redirect('/my-profile');
    })
    .catch(() => res.sendStatus(404));
});

module.exports = router;