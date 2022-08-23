const express = require('express');
const router = express.Router();

const sha256 = require('js-sha256');

const User = require('../models/user');

router.post('/update/:id', (req, res) => {
  let id = req.params.id,
      alert;

  if (req.session.user._id !== id)
      return res.sendStatus(404);

  let user;

  User
  .findById(id)
  .then(e => {
    if (e == null)
        return Promise.reject(new Error("User doesn't exist!"));

    user = e;

    user.username = req.body.username;
    user.email = req.body.email;

    user
    .save()
    .then(e => {
      req.session.user = user;

      res.redirect('/my-profile#settings');
    })
    .catch(e => {
      return Promise.reject(e);
    });
  })
  .catch(e => {
    alert = {type: 'error', source: 'update', message: e.message}
    req.session.alert = alert;

    alert = null;
    return res.redirect('/my-profile#settings');
  });
});

router.post('/change-password/:id', (req, res) => {
  let id = req.params.id;

  let currentPassword = req.body.cpassword,
      newPassword = req.body.npassword,
      confirmNewPassword = req.body.cnpassword;

  if (req.session.user._id !== id)
      return res.sendStatus(404);

  let alert;

  if (newPassword !== confirmNewPassword)
      alert = {type: 'error', source: 'password', message: "Passwords aren't matching!"};

  if (sha256(currentPassword) !== req.session.user.password)
      alert = {type: 'error', source: 'password', message: "Incorrect old password!"};

  if (alert !== undefined) {
      req.session.alert = alert;

      alert = null;
      return res.redirect('/my-profile#settings');
  }

  let user;

  User
  .findById(id)
  .then(e => {
    if (e == null)
        return Promise.reject(new Error("User doesn't exist!"));

    user = e;

    user.password = sha256(newPassword);

    user
    .save()
    .then(e => {
      req.session.user = user;

      return res.redirect('/my-profile#settings');
    })
    .catch(e => Promise.reject(e));
  })
  .catch(e => {
    alert = {type: 'error', source: 'password', message: e.message}
    req.session.alert = alert;

    alert = null;
    return res.redirect('/my-profile#settings');
  });
});

router.get('/delete/:id', (req, res) => {
  let id = req.params.id,
      alert;
      
  if (req.session.user._id !== id)
      return res.sendStatus(404);

  User
  .findByIdAndDelete(id)
  .then(e => {
    if (e == null)
        return Promise.reject(new Error("User doesn't exist!"));

    return res.redirect('/log-out');
  })
  .catch(e => res.redirect('/my-profile#settings'));
});

module.exports = router;