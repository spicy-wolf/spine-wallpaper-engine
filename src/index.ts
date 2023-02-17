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
import * as threejsSpine from 'threejs-spine-3.8-runtime-es6';
import { SpineAnimator, TextureAnimator, VideoAnimator } from './animator';
import { Configs } from './config.type';
import { ASSET_PATH } from './constants';
import * as Scene from './initScene';

const main = async () => {
  const configs: Configs = await (await fetch('./assets/config.json')).json();
  Scene.initScene(configs);

  /**
   * start here
   */
  let lastFrameTime = Date.now() / 1000;
  const spineAssetManager = new threejsSpine.AssetManager(ASSET_PATH);
  const threeAssetList: { [path: string]: THREE.Texture } = {};
  const meshUpdateCallbacks: Array<(delta: number) => void> = [];

  /**
   * loader
   */
  configs?.meshes?.forEach((meshConfig) => {
    switch (meshConfig?.type) {
      case 'spine': {
        // load scheleton
        if (meshConfig.skeletonFileName) {
          spineAssetManager.loadBinary(meshConfig.skeletonFileName);
        } else if (meshConfig.jsonFileName) {
          spineAssetManager.loadText(meshConfig.jsonFileName);
        } else {
          throw 'missing skeleton file';
        }
        // load atlas
        if (meshConfig.atlasFileName) {
          spineAssetManager.loadTextureAtlas(
            meshConfig.atlasFileName,
            // onLoad callback
            () => {
              // skip
            },
            // onError callback
            (path: string, error: string) => {
              console.error('Cannot load spine', path, error, meshConfig);
            }
          );
        }
        break;
      }
      case 'texture': {
        if (!meshConfig.textureFileName) {
          throw 'missing texture file path';
        }
        if (!!threeAssetList[meshConfig.textureFileName]) {
          // texture has been loaded, skip
          break;
        }
        threeAssetList[meshConfig.textureFileName] = null;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          ASSET_PATH + meshConfig.textureFileName,
          // onLoad callback
          (texture: THREE.Texture) => {
            threeAssetList[meshConfig.textureFileName] = texture;
          },
          // onProgress callback currently not supported
          undefined,
          // onError callback
          (err: ErrorEvent) => {
            console.error('Cannot load texture', err, meshConfig);
          }
        );
        break;
      }
      case 'video': {
        // video texture is loaded from <video> dom element
        break;
      }
      default:
        break;
    }
  });

  /**
   * when everthing is fully loaded, setup each animation update() function
   */
  const waitLoad = () => {
    // if spine assets are loaded and three assets are also loaded
    if (
      spineAssetManager.isLoadingComplete() &&
      !Object.entries(threeAssetList).some(([assetPath, texture]) => !texture)
    ) {
      configs?.meshes?.forEach((meshConfig) => {
        switch (meshConfig.type) {
          case 'spine': {
            const spineAnimator = new SpineAnimator(
              meshConfig,
              spineAssetManager
            );
            meshUpdateCallbacks.push(function (delta: number) {
              spineAnimator.update(delta);
            });
            break;
          }
          case 'texture': {
            const textureAnimator = new TextureAnimator(
              meshConfig,
              threeAssetList[meshConfig?.textureFileName]
            );
            meshUpdateCallbacks.push(function (delta: number) {
              textureAnimator.update(delta);
            });
            break;
          }
          case 'video': {
            const videoAnimator = new VideoAnimator(meshConfig);
            // meshUpdateCallbacks.push(function (delta: number) {
            //   videoAnimator.update(delta);
            // });
            break;
          }
          default:
            break;
        }
      });

      requestAnimationFrame(render);
    } else {
      requestAnimationFrame(waitLoad);
    }
  };

  // Render Loop
  const render = () => {
    const now = Date.now() / 1000;
    const delta = now - lastFrameTime;
    lastFrameTime = now;
    meshUpdateCallbacks.forEach((callback) => callback(delta));
    Scene.renderer?.render(Scene.scene, Scene.camera);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(waitLoad);
};

main();
