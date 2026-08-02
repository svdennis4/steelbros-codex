export function calculateElo(
  playerOneElo: number,
  playerTwoElo: number,
  result: "PLAYER_ONE" | "PLAYER_TWO" | "DRAW"
) {
  const K = 32;

  const expectedPlayerOne =
    1 /
    (1 +
      Math.pow(
        10,
        (playerTwoElo - playerOneElo) / 400
      ));

  const expectedPlayerTwo = 1 - expectedPlayerOne;

  let actualPlayerOne: number;
  let actualPlayerTwo: number;

  if (result === "PLAYER_ONE") {
    actualPlayerOne = 1;
    actualPlayerTwo = 0;
  } else if (result === "PLAYER_TWO") {
    actualPlayerOne = 0;
    actualPlayerTwo = 1;
  } else {
    actualPlayerOne = 0.5;
    actualPlayerTwo = 0.5;
  }

  const playerOneNewElo = Math.round(
    playerOneElo +
      K * (actualPlayerOne - expectedPlayerOne)
  );

  const playerTwoNewElo = Math.round(
    playerTwoElo +
      K * (actualPlayerTwo - expectedPlayerTwo)
  );

  return {
    playerOneBefore: playerOneElo,
    playerOneAfter: playerOneNewElo,
    playerOneChange: playerOneNewElo - playerOneElo,

    playerTwoBefore: playerTwoElo,
    playerTwoAfter: playerTwoNewElo,
    playerTwoChange: playerTwoNewElo - playerTwoElo,
  };
}