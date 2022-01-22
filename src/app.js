const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')

const stats = require('./controllers/stats');
const games = require('./controllers/games');
const { fetchCompleteHistory, webSocketConnection } = require('./bad-api');

require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);

if(process.argv[2] === '--fetchHistory'){
  fetchCompleteHistory('/rps/history');
  webSocketConnection();
} else {
  webSocketConnection();
}

app.use(cors());
app.get('/', (req, res) => {
  res.send('<h1>Good api</h1>');
});
app.use('/rps', stats.router);
app.use('/rps', games.router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
