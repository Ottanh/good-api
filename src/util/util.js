
/**
 * If a won return { a: 1, b: 0}
 * If b won return { a: 0, b: 1}
 */
const winner = (a, b) => {
  const wins = { a: 0, b: 0 };

  // a wins
  if (a === 'ROCK' && b === 'SCISSORS') {
    wins.a = 1;
  } else if (a === 'PAPER' && b === 'ROCK') {
    wins.a = 1;
  } else if (a === 'SCISSORS' && b === 'PAPER') {
    wins.a = 1;
  }
  // b wins
  if (b === 'ROCK' && a === 'SCISSORS') {
    wins.b = 1;
  } else if (b === 'PAPER' && a === 'ROCK') {
    wins.b = 1;
  } else if (b === 'SCISSORS' && a === 'PAPER') {
    wins.b = 1;
  }

  return wins;
};

module.exports = { winner };
