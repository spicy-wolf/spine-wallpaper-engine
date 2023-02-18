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
import { TextureMeshConfig } from '@src/config.type';
import * as Scene from '@src/initScene';

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
   * @param meshConfig
   * @param texture
   */
  constructor(meshConfig: TextureMeshConfig, texture: THREE.Texture) {
    if (!texture) {
      throw 'texture does not fully loaded';
    }
    var material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      alphaTest: 1,
    });
    var geometry = new THREE.PlaneGeometry(
      meshConfig?.width,
      meshConfig?.height,
      1,
      1
    );
    geometry.scale(
      meshConfig.scale ?? 1,
      meshConfig.scale ?? 1,
      meshConfig.scale ?? 1
    );
    var textureMesh = new THREE.Mesh(geometry, material);
    textureMesh.position.set(
      meshConfig?.position?.x ?? 0,
      meshConfig?.position?.y ?? 0,
      meshConfig?.position?.z ?? -1000
    );
    Scene.scene?.add(textureMesh);

    this.texture = texture;
    this.tilesHorizontal = meshConfig?.tilesHorizontal ?? 1;
    this.tilesVertical = meshConfig?.tilesVertical ?? 1;
    this.numberOfTiles = meshConfig?.numTiles ?? 1;
    this.tileDisplayDuration = meshConfig?.tileDisplayDuration ?? 0;

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;
  }

  public update = (delta: number) => {
    const milliSec = 1000 * delta;
    // if display time is zero for each tile, then no animation
    if (this.tileDisplayDuration === 0) {
      return;
    }

    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile === this.numberOfTiles) this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      this.texture.offset.x = currentColumn / this.tilesHorizontal;
      var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
      this.texture.offset.y = currentRow / this.tilesVertical;
    }
  };
}
