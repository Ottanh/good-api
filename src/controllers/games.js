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
  try {
    // Push games to player's record.
    await Games.updateOne({ _id: player }, { $addToSet: { games: games } }, { upsert: true, new: true });
  } catch (e) {
    console.log(e.message);
  }
};


router.get('/games/:id', async (req, res) => {
  try {
    const games = await Games.findById(req.params.id);
    res.json(games);
  } catch (e) {
    console.log(e);
  }
});

module.exports = { router, addGames};
