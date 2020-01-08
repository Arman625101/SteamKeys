const User = require('../models/User');
const Cases = require('../models/Cases');
const Livedrop = require('../models/Livedrop');
const Games = require('../models/Games');
const Benefit = require('../models/Benefit');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const { ADMIN1, ADMIN2 } = process.env;

const register = async data => {
  const user = await new User({
    ip: data.ip,
    email: data.email || data.username,
    username: data.username,
    userID: data.userID,
    imgurl: data.imgurl,
    admin: false,
    profileurl: data.profileurl,
    walletq: '',
    walletp: '',
    balance: 0,
    gameHistory: [],
    balanceHistory: [],
    benefitHistory: [],
  });
  // eslint-disable-next-line no-unused-expressions
  data.userID === ADMIN1 || data.userID === ADMIN2
    ? (user.admin = await true)
    : null;
  await user.save();
  return user;
};

const login = userID => User.findOne({ userID });

const update = async user => {
  login(user.userID).then(data => {
    if (data !== null) {
      if (data.username !== user.username) {
        console.log('Changed name');
        User.updateOne(
          { userID: user.userID },
          { $set: { username: user.username } },
          { new: true },
          (err, doc) => doc,
        );
      }
      if (data.imgurl !== user.imgurl) {
        console.log('Changed image');
        User.updateOne(
          { userID: user.userID },
          { $set: { imgurl: user.imgurl } },
          { new: true },
          (err, doc) => doc,
        );
      }

      if (data.ip.city !== user.ip.city) {
        User.updateOne(
          { userID: user.userID },
          { $set: { ip: user.ip } },
          { new: true },
          (err, doc) => doc,
        );
      }
    } else {
      console.log('New User');
    }
  });
};

const getCase = type => Cases.findOne({ type }).then(res => res);

const getLivedrop = () => Livedrop.find({});
const getBenefit = () => Benefit.find({});

const setLivedrop = async data => {
  const drop = await new Livedrop(data.game);
  await drop.save();
  return drop;
};

const setBenefit = async data =>{
  const benef = await new Benefit(data.benefit);
  await benef.save();
  return benef;
}

const getGames = () => Games.find({});

const getLiveinfo = async () => {
  // Cases.deleteOne({ _id: {} }).then(res => console.log('done', res));
  const openCasesLength = () =>
    new Promise((resolve, reject) => {
      Livedrop.collection.countDocuments({}, {}, (err, res) => resolve(res));
    });

  const usersLength = () =>
    new Promise((resolve, reject) => {
      User.collection.countDocuments({}, {}, (err, res) => resolve(res));
    });

  return Promise.all([await usersLength(), await openCasesLength()]).then(
    val => val,
  );
};

const setDeposit = (user, data) => 
  new Promise((resolve, reject) =>{
    User.findOne({ userID: user.userID }).then(res =>{
      User.findOneAndUpdate(
        {
          userID: user.userID,
        },
        {
        $set: {
          balance: res.balance - Number(data.amount),
          benefitHistory: [
            ...res.benefitHistory,
            {
              amount: data.amount,
              action: 'waiting',
              time: new Date().getTime() + 1000 * 60 * 60 * 24,
              date: new Date(),
            },
          ],
        },
      },
      {new: true},
      (err,doc) => resolve(doc._doc || {}),
      );
    });
  });

  const setWallet = (user, data) => 
  new Promise((resolve, reject) =>{
    User.findOne({ userID: user.userID }).then(res =>{
      User.findOneAndUpdate(
        {
          userID: user.userID,
        },
        {
        $set: {
          walletp: data.walletp,
          walletq: data.walletq
        },
      },
      {new: true},
      (err,doc) => resolve(doc._doc || {}),
      );
    });
  });


const addBalance = (user, data) =>
  new Promise((resolve, reject) => {
    User.findOne({ userID: user.userID }).then(res => {
      User.findOneAndUpdate(
        {
          userID: user.userID,
        },
        {
          $set: {
            balance: res.balance + Number(data.amount),
            balanceHistory: [
              ...res.balanceHistory,
              {
                pay_id: data.pay_id,
                amount: data.amount,
                date: new Date(),
              },
            ],
          },
        },
        { new: true },
        (err, doc) => resolve(doc._doc || {}),
      );
    });
  });

const sellGame = (user, data) =>
  new Promise((resolve, reject) => {
    User.findOne({ userID: user.userID }).then(res => {
      User.findOneAndUpdate(
        {
          userID: user.userID,
          'gameHistory._id': data._id,
        },
        {
          $set: {
            balance: res.balance + data.sellPrice,
            'gameHistory.$.action': 'selled',
          },
        },
        { new: true },
        (err, doc) => resolve(doc._doc),
      );
    });
  });

  const getMoney = (user, data) =>
  new Promise((resolve, reject) => {
    User.findOne({ userID: user.userID }).then(res => {
      User.findOneAndUpdate(
        {
          userID: user.userID,
          'benefitHistory._id': data._id,
        },
        {
          $set: {
            balance: res.balance + data.amount/0.2,
            'benefitHistory.$.action': 'paid',
          },
        },
        { new: true },
        (err, doc) => resolve(doc._doc),
      );
    });
  });

const removeBalance = (user, data) =>
  new Promise((resolve, reject) => {
    User.findOne({ userID: user.userID }).then(res => {
      if (data.type === 'balance') {
        Livedrop.collection.countDocuments({}, {}, (error, count) => {
          const order = data.caseType === 'xujan' ? data.order : count + 1;
          User.findOneAndUpdate(
            { userID: user.userID },
            {
              $set: {
                balance: res.balance - data.price,
                gameHistory: [
                  ...res.gameHistory,
                  {
                    key: '',
                    order,
                    sellPrice: data.sellPrice,
                    caseType: data.caseType,
                    name: data.name,
                    action: 'waiting',
                    date: new Date(),
                  },
                ],
              },
            },
            { new: true },
            (err, doc) => resolve(doc._doc || {}),
          );
        });
      }
    });
  });

const getKey = (user, data) =>
  new Promise((resolve, reject) => {
    User.findOne({ userID: user.userID }).then(res => {
      User.findOneAndUpdate(
        {
          userID: user.userID,
          'gameHistory._id': data._id,
        },
        {
          $set: {
            'gameHistory.$.action': 'key',
          },
        },
        { new: true },
        (err, doc) => resolve(doc._doc),
      );
    });
  });

module.exports = {
  login,
  register,
  update,
  getCase,
  setLivedrop,
  getLivedrop,
  setDeposit,
  setWallet,
  getBenefit,
  getMoney,
  getGames,
  getLiveinfo,
  removeBalance,
  sellGame,
  getKey,
  addBalance,
};
