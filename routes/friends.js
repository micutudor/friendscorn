const express = require('express');
const user = require('../models/user');
const router = express.Router();

const mongoose = require('mongoose');

const User = require('../models/user');

router.get('/', async (req, res) => {
  let alert = req.session.alert;

  req.session.alert = null;

  if (!req.session.loggedIn)
      return res.send(404);

  let friendshipsData = await User.find({ friendships: { $in: [req.session.user._id] } });

  res.render('friends', {page: {name: 'Friends', activePage: 'friends'}, session: req.session, alert, friendshipsData})
});

router.post('/add', (req, res) => {
  let email = req.body.email,
      userSession = req.session.user,
      alert;

  if (!req.session.loggedIn)
      return res.sendStatus(404);

  if (email === userSession.email)
      alert = {type: 'error', message: 'You can be your friend, but in the real life!'};

  if (alert !== undefined)
  {
      req.session.alert = alert;

      alert = null;
      return res.redirect('/friends');
  }

  User
  .findOne({ email })
  .then(e => {
    if (e == null)
        return Promise.reject(new Error(`The user with email ${email} doesn't exist!`));

    if (userSession.friendships.includes(e._id.toString()))
        return Promise.reject(new Error('You are already sent or received friend request from this user. Or you are already friends!'));
    
    let user; 
    
    User
    .findByIdAndUpdate(userSession._id, { $push: { friendships: e._id }}, {new: true})
    .then(u => {
      req.session.user = u;

      alert = {type: 'success', message: "Friend request sent!"};
      req.session.alert = alert;
  
      alert = null;
      return res.redirect('/friends');
    });
  })
  .catch(e => {
    alert = {type: 'error', message: e.message};
    req.session.alert = alert;

    alert = null;
    return res.redirect('/friends');
  });
});

router.get('/add/:id', (req, res) => {
  let id = req.params.id,
      userSession = req.session.user;

  if (!req.session.loggedIn)
      return res.sendStatus(404);

  if (userSession.friendships.includes(id))
      return res.sendStatus(404);

  User
  .findById(id)
  .then(e => {
    if (!e.friendships.includes(userSession._id.toString()))
        return res.sendStatus(404);

    User
    .findByIdAndUpdate(userSession._id, { $push: { friendships: id }}, {new: true})
    .then(u => {
      req.session.user = u;
      req.session.alert = {type: 'success', message: 'Friendship accepted!'};

      return res.redirect('/friends');
    })
  })
  .catch(e => {
    console.log(e.message);

    return res.redirect('/friends');
  });

});

router.get('/remove/:id', (req, res) => {
  let id = req.params.id,
      user = req.session.user;

  if (!req.session.loggedIn)
      return res.sendStatus(404);

  if (!user.friendships.includes(id)) {
      return res.sendStatus(404);
  }

  User
  .findById(id)
  .then(async e => {
    if (!e.friendships.includes(user._id.toString()))
        return res.sendStatus(404);

    await User.findByIdAndUpdate(id, { $pull: { friendships: user._id }});

    User
    .findByIdAndUpdate(user._id, { $pull: { friendships: id }}, { new: true })
    .then(u => req.session.user = u);

    req.session.alert = {type: 'success', message: 'Friend removed!'};

    return res.redirect('/friends');
  });

});

module.exports = router;