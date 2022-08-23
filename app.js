const express = require('express');
const app = express();

const fetch = require('cross-fetch');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(cookieParser());
app.use(session({
    secret: 'jQBfM9As0SnOmG5ZXppkDFaDiJF9xyZQ', 
    resave: false, 
    saveUninitialized: true,
}));

app.get('/', async (req, res) => {
    let friendsReviews = [], moviesData = [];

    let alert = req.session.alert;

    req.session.alert = null;

    if (req.session.loggedIn) {
        const User = require('./models/user');
        const Review = require('./models/review');

        let friendsData = await User.find({ friendships: { $in: [req.session.user._id] }});

        let friends = [];
        for (friend of friendsData)
            if (req.session.user.friendships.includes(friend._id.toString()))
                friends.push(friend._id);

        friendsReviews = await Review.find({ authorId: { $in: [friends] }});
        
        const movies = new Set();

        for (friendReview of friendsReviews) {
            let friendData = await User.find({ _id: friendReview.authorId });
            friendReview.authorName = friendData[0].username;
            movies.add(friendReview.movieId);
        }

        for (movie of movies) {
            let movieData = await fetch(`https://api.themoviedb.org/3/movie/${movie}?api_key=213880a63c37b5a71551ad2885f989e6`);
            moviesData.push(await movieData.json());
        }
    }

    res.render('homepage', {page: {name: 'Welcome', activePage: 'feed'}, session: req.session, posts: friendsReviews, movies: moviesData, alert});
});

app.get('/my-profile', async (req, res) => {
    let alert = req.session.alert;

    req.session.alert = null;

    if (!req.session.loggedIn)
        res.send(404);

    const Review = require('./models/review');

    let myReviews = await Review.find({ authorId: req.session.user._id });
    
    const movies = new Set();

    let moviesData = [];

    for (myReview of myReviews) {
        let movieData = await fetch(`https://api.themoviedb.org/3/movie/${myReview.movieId}?api_key=213880a63c37b5a71551ad2885f989e6`);
        moviesData.push(await movieData.json());
    }
    
    res.render('profile', {page: {name: 'My profile', activePage: 'my-profile'}, profileData: req.session.user, session: req.session, alert, movies: moviesData, posts: myReviews})
});

app.get('/profile/:id', (req, res) => {
    let alert = req.session.alert;

    req.session.alert = null;

    if (!req.session.loggedIn)
        res.send(404);

    const User = require('./models/user');
    const Review = require('./models/review');

    User
    .findOne({_id: req.params.id})
    .then(async e => {
        let userReviews = await Review.find({ authorId: e._id });
    
        const movies = new Set();
    
        let moviesData = [];
    
        for (userReview of userReviews) {
            let movieData = await fetch(`https://api.themoviedb.org/3/movie/${userReview.movieId}?api_key=213880a63c37b5a71551ad2885f989e6`);
            moviesData.push(await movieData.json());
        }

        res.render('profile', {page: {name: 'My profile', activePage: 'my-profile'}, profileData: e, session: req.session, alert, movies: moviesData, posts: userReviews});
    })
    .catch(e => res.send(404));
});

app.get('/log-out', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const userRouter = require('./routes/user');
app.use('/user', userRouter);

const friendsRouter = require('./routes/friends');
app.use('/friends', friendsRouter);

const reviewRouter = require('./routes/review');
const review = require('./models/review');
app.use('/review', reviewRouter);

app.listen(3000);