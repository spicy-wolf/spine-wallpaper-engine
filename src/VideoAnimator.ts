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
import { VideoMeshConfig } from './config.type';
import { ASSET_PATH } from './constants';

/**
 * from example: https://stemkoski.github.io/Three.js/Texture-Animation.html
 */
export class VideoAnimator {
  constructor(meshConfig: VideoMeshConfig, scene: THREE.Scene) {
    if (!meshConfig.videoFileName) {
      throw 'missing video file name';
    }

    //Get your video element:
    const videoElement = document.createElement('video');
    videoElement.src = ASSET_PATH + meshConfig.videoFileName;
    videoElement.width = meshConfig.width ?? 1000;
    videoElement.height = meshConfig.height ?? 900;
    videoElement.muted = true;
    videoElement.loop = true;
    videoElement.style.display = 'none';
    videoElement.play();

    //Create your video texture:
    const videoTexture = new THREE.VideoTexture(videoElement);
    const videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.FrontSide,
    });
    const geometry = new THREE.PlaneGeometry(
      videoElement.width,
      videoElement.height
    );
    geometry.scale(
      meshConfig.scale ?? 1,
      meshConfig.scale ?? 1,
      meshConfig.scale ?? 1
    );
    const videoScreenMesh = new THREE.Mesh(geometry, videoMaterial);
    videoScreenMesh.position.set(
      meshConfig?.position?.x ?? 0,
      meshConfig?.position?.y ?? 0,
      meshConfig?.position?.z ?? -1000
    );
    scene.add(videoScreenMesh);
  }

  public update = (milliSec: number) => {};
}
