const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { getWinner } = require('../util/util');

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

  //add player's stats from each game to playerStats
  games.forEach(game => {
    let playerAB = player === game.playerA.name 
      ? game.playerA 
      : game.playerB;

    if(playerAB.name === getWinner(game.playerA, game.playerB)){
      playerStats.wins += 1;
    }
    playerStats.games += 1;
    playerStats[playerAB.played] += 1;
  });


  // Increment player's record by values in playerStats
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
