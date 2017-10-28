const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('./config');
var cookieSession = require('cookie-session')
const app = express();


/************** start settings for Passport */
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    },
    function (accessToken, refreshToken, profile, cb) {
        cb(null, profile);
    }
));
/************** end settings */

app.set('view engine', 'pug');
app.set('views', './views');
app.use('/static', express.static("assets"))


//set cookies-session
app.use(cookieSession({
    name: 'magicApp',
    keys: config.COOKIE_KEYS ,
    maxAge:  10 * 60 * 100 // 10minutes (in milisecoonds)
}))

app.use(passport.initialize());
app.use(passport.session());


/*********** app routes */
app.get('/', (req, res) => {
    if(req.isAuthenticated()) {
        res.redirect('/logged');   
    } else {    
        res.render('index');
    }
});

app.get('/logged', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('logged', {user: req.session.passport.user});
    } else {
        showError (req.url, res);
    }
});

app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

app.get('/info', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('info', {user: req.session.passport.user});
    } else {
        showError (req.url, res);
    }
});

/********* passport routes */
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/logged',
        failureRedirect: '/'
    })
);

app.use((req, res, next) => { 
    if(req.isAuthenticated()) {
        res.render('logged', {user: req.session.passport.user});
    } else {
        showError (req.url, res);
    }
});

app.listen(3000);

function showError (url, res) {
    res.render('error', {url: url});
}