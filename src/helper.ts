/**
 * @license
 * Spine Wallpaper Engine. This is a Spine animation player for wallpaper engine.
 * Copyright (C) 2023 Spicy Wolf
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
