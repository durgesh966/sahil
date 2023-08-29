const express = require('express');
require('dotenv').config();
const colors = require('colors');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;

const frontend = path.join(__dirname, 'public');
app.use(express.static(frontend));


// mongoDB 
const mongoURI = process.env.MONGOURI;
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Mongodb connected hogya Hai'.bgCyan.black);
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// schema db
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);


app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'your-secret-key',
        resave: true,
        saveUninitialized: true,
    })
);
// sign up

app.get('/', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        res.redirect('login');
    } catch (error) {
        console.error(error);
        res.redirect('/signup');
    }
});



app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.redirect('/');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user })
    } else {
        res.redirect('/');
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`.bgGreen.black);
});
