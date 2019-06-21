const User = require('../models/User');
const Cases = require('../models/Cases');
const Livedrop = require('../models/Livedrop');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const { ADMIN1, ADMIN2 } = process.env;

const register = async data => {
  const user = await new User({
    username: data.username,
    steamid: data.steamid,
    imgurl: data.imgurl,
    admin: false,
    profileurl: data.profileurl,
    balance: 0,
  });
  // eslint-disable-next-line no-unused-expressions
  data.steamid === ADMIN1 || data.steamid === ADMIN2
    ? (user.admin = await true)
    : null;
  await user.save();
  return user;
};

const login = steamid => User.findOne({ steamid });

const update = async user => {
  login(user.steamid).then(data => {
    if (data !== null) {
      if (data.username !== user.username) {
        console.log('Changed name');
        User.updateOne(
          { steamid: user.steamid },
          { $set: { username: user.username } },
          { new: true },
          (err, doc) => doc,
        );
      }
      if (data.imgurl !== user.imgurl) {
        console.log('Changed image');
        User.updateOne(
          { steamid: user.steamid },
          { $set: { imgurl: user.imgurl } },
          { new: true },
          (err, doc) => doc,
        );
      }
    } else {
      console.log('New User');
    }
  });
};

const getCase = type =>
  Cases.findOne({ type })
    .then(res => res.data)
    .then(arr => arr);

const getLivedrop = () => Livedrop.find({});

const setLivedrop = async data => {
  const drop = await new Livedrop(data.game);
  await drop.save();
  return drop;
};

module.exports = {
  login,
  register,
  update,
  getCase,
  setLivedrop,
  getLivedrop,
};
