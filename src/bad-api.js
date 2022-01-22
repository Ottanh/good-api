const WebSocket = require('ws');
const axios = require('axios');
const axiosRetry = require('axios-retry');

const stats = require('./controllers/stats');
const games = require('./controllers/games');

axiosRetry(axios, {
  retries: 100, // number of retries
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return retryCount * 2; // time interval between retries
  }
});

/**
 * Fetch the entire history from bad-api and add it to the database.
 */
const fetchCompleteHistory = async (cursor) => {
  // Raw data from bad-api
  let data = [];
  // Each player and all of their games
  const players = {};

  // Get data from bad api
  const response = await axios
    .get(`https://bad-api-assignment.reaktor.com${cursor}`);
  let page = response.data;
  data.concat(page.data);

  let j = 0;
  do {
    const response = await axios
      .get(`https://bad-api-assignment.reaktor.com${page.cursor}`);
    page = response.data;
    console.log(data.length);
    data = data.concat(page.data);
    j++;
  } while (page.cursor !== null && j < 100);

  // Refining data into 'players'
  for (let i = 0; i < data.length; i++) {
    const game = data[i];
    const playerA = game.playerA.name;
    const playerB = game.playerB.name;

    // Add game to playerA's record
    players[playerA] = (players[playerA] === undefined) ? [game] : players[playerA].concat(game);
    // Add game to playerB's record
    players[playerB] = (players[playerB] === undefined) ? [game] : players[playerB].concat(game);

    data[i] = null;
  }

  // Add games to database
  for (const player in players) {
    console.log(player);
    games.addGames(player, players[player]);
    stats.addStatsFromGames(player, players[player]);
    players[player] = null;
  }

  if(page.cursor !== null){
    fetchCompleteHistory(page.cursor);
  }
};

/**
 * Open a connection to bad-api and add received game results to database.
 */
const webSocketConnection = () => {
  // Open connection to bad-api
  const webSocket = new WebSocket('wss://bad-api-assignment.reaktor.com/rps/live');

  webSocket.onopen = () => {
    console.log('connected');
  };

  // Add new game results to database
  webSocket.onmessage = (event) => {
    const game = JSON.parse(JSON.parse(event.data));

    if (game.type === 'GAME_RESULT') {
      console.log(game);

      const playerGames = {};
      const playerA = game.playerA;
      const playerB = game.playerB;

      playerGames[playerA.name] = [game];
      playerGames[playerB.name] = [game];

      for (const player in playerGames) {
        games.addGames(player, playerGames[player]);
        stats.addStatsFromGames(player, playerGames[player]);
      }
    }
  };
};

module.exports = { fetchCompleteHistory, webSocketConnection };
