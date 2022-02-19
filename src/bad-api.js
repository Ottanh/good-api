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
  let i = 0;
  do {
    const response = await axios
      .get(`https://bad-api-assignment.reaktor.com${cursor}`);
    page = response.data;
    cursor = page.cursor;
    console.log(data.length);
    data = data.concat(page.data);
    i++;
  } while (page.cursor !== null && i < 100);

  // Refining data into 'players'
  data.forEach(game => {
    const playerA = game.playerA.name;
    const playerB = game.playerB.name;

    // Add game to playerA's record
    players[playerA] = (players[playerA] === undefined) ? [game] : players[playerA].concat(game);
    // Add game to playerB's record
    players[playerB] = (players[playerB] === undefined) ? [game] : players[playerB].concat(game);
  })


  // Add games to database
  for (const player in players) {
    console.log(player);
    games.addGames(player, players[player]);
    stats.addStatsFromGames(player, players[player]);
    await new Promise(resolve => setTimeout(resolve, 500));
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
      const players = [game.playerA.name, game.playerB.name];
      players.forEach(player => {
        games.addGames(player, [game]);
        stats.addStatsFromGames(player, [game]);
      })
    }
  };
};

module.exports = { fetchCompleteHistory, webSocketConnection };
