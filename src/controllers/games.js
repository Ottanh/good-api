const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const playerGamesSchema = new mongoose.Schema({
  _id: String,
  games: Array
});
const Games = mongoose.model('Games', playerGamesSchema);

/**
 * Add all games to player.
 */
const addGames = (player, games) => {
  // Find player and push games to their record.
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

/**
 * Used when initially fetching historical data.
 */
const addGamesInitial = (player, games) => {
  const game = new Games({
    _id: player,
    games: games
  });

  game.save()
    .then(() => {
      console.log('games saved!');
    });
};

router.get('/games/:id', (req, res) => {
  Games.findById(req.params.id)
    .then(stats => {
      res.json(stats);
    });
});

module.exports = { router, addGames, addGamesInitial };
