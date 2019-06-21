const mongoose = require('mongoose');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  port = 3000,
} = process.env;
const socket = require('../socket');

module.exports = app => {
  const http = require('http').createServer(app);
  const io = require('socket.io')(http);
  socket(io);
  http.listen(port, () => console.log(`listening on http://localhost:${port}`));

  mongoose.connect(
    `mongodb://${DB_USER}:${DB_PASS}${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    {
      useNewUrlParser: true,
      useFindAndModify: true,
    },
  );
};
