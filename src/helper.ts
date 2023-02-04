/**
 *
 * @param input the original distance/position input
 * @param boostFactor sometimes we do not want to slow down too much, need extra boost
 * @returns the value after slow down
 */
export const curosrMoveSlowDownFormula = (
  input: number,
  boostFactor: number = 100
): number => {
  /**
   * https://en.wikipedia.org/wiki/Sigmoid_function
   */
  // logistic function
  // const afterSlowDown =
  //   (1 /
  //     (1 +
  //       Math.exp(
  //         -1 * (input / Math.max(window.innerWidth, window.innerHeight))
  //       )) -
  //     0.5) *
  //   boostFactor;
  const a = input / Math.min(window.innerWidth, window.innerHeight);
  const afterSlowDown = (a / (1 + Math.abs(a))) * boostFactor;
  return afterSlowDown;
};
