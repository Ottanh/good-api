# good-api

Backend for the reaktor assignement 2022.  
[Link to API](https://good-api-eu.herokuapp.com/)

# Installing and running

After cloning repository:
```
$ npm install
$ npm start
```
To get entire history      
`$ npm run getHistory`

Needs to include .env file with:
```
MONGO_DB=link-to-db
PORT=port
```
# Usage
`GET /rps/stats`  
Returns a page with each player and their stats.

`GET /rps/games/:player`   
Returns a page with all of the player's games.

# How it works
After running `npm start` the app fetches all historical data from [bad-api](https://bad-api-assignment.reaktor.com/),  parses it, and finally adds to the database.  
When all historical data has been saved the app continues to record live games from bad-api and thus keeping up to date.

# TODO
Add tests
