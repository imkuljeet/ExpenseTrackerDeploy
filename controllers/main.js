const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: 'views' });
});

router.get('/home', (req, res) => {
    res.sendFile('home.html', { root: 'views' });
});

router.get('/signup', (req, res) => {
    res.sendFile('signup.html', { root: 'views' });
});

router.get('/forgotpasswordss', (req, res) => {
    res.sendFile('forgotpassword.html', { root: 'views' });
});

router.get('/expensetracker', (req, res) => {
    res.sendFile('expensetracker.html', { root: 'views' });
});

module.exports = router;
