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
 * Goes through every game in games and adds them to player's stats.
 */
const addStatsFromGames = (player, games) => {
  // Loop through games and add them to players stats
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

    // Find player from db and update their stats
    Stats.updateOne({ _id: player }, { $inc: { wins: win, games: 1, [playerAB.played]: 1 } }, { upsert: true, new: true }, function (err) {
      if (err) {
        if (err.code === 11000) {
          // Another upsert occurred during the upsert, try again.
          Stats.updateOne({ _id: player }, { $inc: { wins: win, games: 1, [playerAB.played]: 1 } },
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
  }
};

/**
 * Used when initially fetching historical data.
 */
const addStatsFromGamesInitial = (player, games) => {
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

  const stats = new Stats({
    ...playerStats
  });

  stats.save()
    .then(() => {
      console.log('stats saved!');
    });
};

router.get('/stats', (req, res) => {
  Stats.find({})
    .then(stats => {
      res.json(stats);
    });
});

module.exports = { router, addStatsFromGames, addStatsFromGamesInitial };
