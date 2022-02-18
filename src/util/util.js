
/**
 * If a won return a.name
 * If b won return b.name
 * Else return 'draw'
 */
const getWinner = (a, b) => {

  // a wins
  if (a.played === 'ROCK' && b.played === 'SCISSORS') {
    return a.name;
  } else if (a.played === 'PAPER' && b.played === 'ROCK') {
    return a.name;
  } else if (a.played === 'SCISSORS' && b.played === 'PAPER') {
    return a.name;
  }
  // b wins
  if (b.played === 'ROCK' && a.played === 'SCISSORS') {
    return b.name;
  } else if (b.played === 'PAPER' && a.played === 'ROCK') {
    return b.name;
  } else if (b.played === 'SCISSORS' && a.played === 'PAPER') {
    return b.name;
  }

  //draw
  return 'draw';
};

module.exports = { getWinner };
