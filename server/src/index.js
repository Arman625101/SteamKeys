const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const session = require('express-session');
const passport = require('passport');
const auth = require('./routes/auth');
const cases = require('./routes/cases');
const livedrop = require('./routes/livedrop');
const cors = require('cors');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const setup = require('./utils/start');
require('./utils/passport');

setup(app);
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SECRET],
    maxAge: 24 * 60 * 60 * 100,
  }),
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: 'http://localhost:5000', // allow to server to accept request from different origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // allow session cookie from browser to pass through
  }),
);
app.use('/auth', auth);
app.use(cases);
app.use(livedrop);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.json({
      authenticated: false,
      message: 'user has not been authenticated',
    });
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  res.send('LOL');
});
