const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('./config');
const app = express();
let googleProfile ;


/************** start settings for Passport */
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    },
    function (accessToken, refreshToken, profile, cb) {
        // googleProfile = {
        //     id: profile.id,
        //     displayName: profile.displayName
        // };

        googleProfile = Object.assign(profile);
        cb(null, profile);
    }
));
/************** end settings */

app.set('view engine', 'pug');
app.set('views', './views');
app.use('/static', express.static("assets"))
app.use(passport.initialize());
app.use(passport.session());


/*********** app routes */
app.get('/', (req, res) => {
     
    res.render('index', {user: req.user});
});

app.get('/logged', (req, res) => {
    if(googleProfile) {
        res.render('logged', {user: googleProfile});
    } else {
        showError (req.url, res);
        
    }
});

app.get('/logout', (req, res) => {
    googleProfile = null;
    req.logOut();
    res.redirect('/');
});

app.get('/info', (req, res) => {
    console.log(req.isAuthenticated())
    if(googleProfile) {

        res.render('info', {user: googleProfile});
    } else {
        showError (req.url, res);
    }
});


// app.get('/error', (req, res) => {
//     let url = requestFromUrl;
//     requestFromUrl =null;
//     res.render('error', {url: url});
// });

/********* passport routes */
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/logged',
        failureRedirect: '/'
    })
);

app.use((req, res, next) => { 
    if(googleProfile) {
        res.render('logged', {user: googleProfile});
    } else {
        showError (req.url, res);
    }
});

app.listen(3000);

function showError (url, res) {
    res.render('error', {url: url});
}