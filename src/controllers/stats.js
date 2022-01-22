const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { winner } = require('../util/util');

const playerStatsSchema = new mongoose.Schema({
  _id: String,
  wins: Number,
  games: Number,
  ROCK: Number,
  PAPER: Number,
  SCISSORS: Number
});

const Stats = mongoose.model('Stats', playerStatsSchema);

/**
 * Adds stats from all games given to players's record.
 */
const addStatsFromGames = (player, games) => {
  const playerStats = {
    _id: player,
    wins: 0,
    games: 0,
    ROCK: 0,
    PAPER: 0,
    SCISSORS: 0
  };

  // Loop through games and add them to playerStats
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    let playerAB;
    let win;

    // Check if player is playerA or playerB
    const { a, b } = winner(game.playerA.played, game.playerB.played);
    if (player === game.playerA) {
      playerAB = game.playerA;
      win = a;
    } else {
      playerAB = game.playerB;
      win = b;
    }

    playerStats.wins += win;
    playerStats.games += 1;
    playerStats[playerAB.played] += 1;
  }

  Stats.updateOne({ _id: player }, { $inc: {
    wins: playerStats.wins,
    games: playerStats.games,
    ROCK: playerStats.ROCK,
    PAPER: playerStats.PAPER,
    SCISSORS: playerStats.SCISSORS 
    }}, { upsert: true, new: true }, function (err) {
    if (err) {
      if (err.code === 11000) {
        // Another upsert occurred during the upsert, try again.
        Stats.updateOne({ _id: player }, { $inc: {
          wins: playerStats.wins,
          games: playerStats.games,
          ROCK: playerStats.ROCK,
          PAPER: playerStats.PAPER,
          SCISSORS: playerStats.SCISSORS
          } },
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

router.get('/stats', (req, res) => {
  Stats.find({})
    .then(stats => {
      res.json(stats);
    });
});

module.exports = { router, addStatsFromGames};
