const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const playerGamesSchema = new mongoose.Schema({
  _id: String,
  games: [{
    gameId: {type: String},
    type: {type: String},
    t: {type: Date},
    playerA: {
      name:{type: String},
      played: {type: String}
    },
    playerB: {
      name: {type: String},
      played: {type: String}
    }
  }]
});
const Games = mongoose.model('Games', playerGamesSchema);

/**
 * Add all games to player's record.
 */
const addGames = async (player, games) => {
  // Push games to player's record.
  Games.updateOne({ _id: player }, { $addToSet: { games: games } }, { upsert: true, new: true }, function (err) {
    if (err) {
      if (err.code === 11000) {
        // Another upsert occurred during the upsert, try again.
        Games.updateOne({ _id: player }, { $addToSet: { games: games } },
          function (err) {
            if (err) {
              console.trace(err);
            }
          });
      } else {
        console.trace(err);
      }
    }
  });
};


router.get('/games/:id', (req, res) => {
  Games.findById(req.params.id)
    .then(stats => {
      res.json(stats);
    });
});

module.exports = { router, addGames};
