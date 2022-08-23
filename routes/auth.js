const express = require('express');
const router = express.Router();

const sha256 = require('js-sha256');

const User = require('../models/user');

router
    .route('/sign-up')
    .get((req, res) => {
        if (req.session.loggedIn)
            res.send(404);

        let page = {name: 'Sign up'},
            alert = req.session.alert;

        req.session.alert = null;
        
        res.render('auth/sign_up', {page, alert});
    })
    .post((req, res) => {
        let alert;

        if (req.body.cpassword != req.body.password) {
            alert = {type: 'error', message: "Passwords aren't matching"};

            req.session.alert = alert;
            res.redirect('/auth/sign-up');
        }
        else
            User.create({
                username: req.body.username,
                password: sha256(req.body.password),
                email: req.body.email
            })
            .then(e => {
                alert = {type: 'success', message: "You succesfully signed up!"};
                res.redirect('/auth/log-in');
            })
            .catch(e => {
                alert = {type: 'error', message: "Passwords aren't matching"};

                req.session.alert = alert;
                res.redirect('/auth/sign-up');
            });
    });

router
    .route('/log-in')
    .get((req, res) => {
        if (req.session.loggedIn)
            res.send(404);

        let page = {name: 'Log in'},
            alert = req.session.alert;

        req.session.alert = null;

        res.render('auth/log_in', {page, alert});
    })
    .post((req, res) => {
        User.findOne({
            email: req.body.email, 
            password: sha256(req.body.password),
        })
        .exec()
        .then(e => {
            if (e == null)
                return Promise.reject(new Error('Email/password incorrect.'));

            req.session.loggedIn = true;
            req.session.user = e;
            
            req.session.alert = null;
            res.redirect('/');

        }).catch(e => {
            let alert = {type: 'error', message: e.message};
            
            req.session.alert = alert;
            res.redirect('/auth/log-in');
        })
    });

module.exports = router;