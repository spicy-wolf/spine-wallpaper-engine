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

import * as THREE from 'three';

/**
 * from example: https://stemkoski.github.io/Three.js/Texture-Animation.html
 */
export class TextureAnimator {
  private texture: THREE.Texture;
  private tilesHorizontal: number;
  private tilesVertical: number;
  private numberOfTiles: number;
  private tileDisplayDuration: number;
  private currentDisplayTime: number;
  private currentTile: number;

  /**
   *
   * @param texture see THREE.texture
   * @param tilesHorizontal number of tiles horizontally
   * @param tilesVertical number of tiles vertically
   * @param numTiles total number of tiles
   * @param tileDisplayDuration how long should each image be displayed
   */
  constructor(
    texture: THREE.Texture,
    tilesHorizontal: number,
    tilesVertical: number,
    numTiles: number,
    tileDisplayDuration: number
  ) {
    this.texture = texture;
    this.tilesHorizontal = tilesHorizontal;
    this.tilesVertical = tilesVertical;
    this.numberOfTiles = numTiles;
    this.tileDisplayDuration = tileDisplayDuration;

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;
  }

  public update = (milliSec: number) => {
    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles) this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      this.texture.offset.x = currentColumn / this.tilesHorizontal;
      var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
      this.texture.offset.y = currentRow / this.tilesVertical;
    }
  };
}
