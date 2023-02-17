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
import { ActionAnimation, Configs } from './config.type';
import { curosrMoveSlowDownFormula } from './helper';

const main = async () => {
  const configs: Configs = await (await fetch('./assets/config.json')).json();
  const width = configs.width ?? 2048;
  const height = configs.height ?? 2048;

  //#region BASIC SETUP
  // Create an empty scene
  const scene = new THREE.Scene();

  // Create a basic perspective camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 1, 5000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  // Create a renderer with Antialiasing
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // Configure renderer clear color
  renderer.setClearColor('#000000');
  // Configure renderer size
  renderer.setSize(width, height);
  // Append Renderer to DOM
  const canvasElement = renderer.domElement;
  document.body.appendChild(canvasElement);
  //#endregion

  //#region event register
  window.addEventListener('resize', onWindowResize, false);
  function onWindowResize() {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  let cursorX: number = 0,
    cursorY: number = 0;
  document.addEventListener('mousemove', onMouseMove, false);
  function onMouseMove(event: MouseEvent) {
    // Update the mouse variable
    event.preventDefault();
    cursorX = (event.clientX / width) * 2 - 1;
    cursorY = -(event.clientY / height) * 2 + 1;
  }
  //#endregion

  /**
   * generate a function which is executed in each render round to follow the cursor
   *
   * @param skeletonMesh the Spine mesh
   * @param actionAnimationConfig cursor follow/press animation config
   * @param skeletonData this is used to get init bone position
   * @returns a callback function to be executed in each render
   */
  const generateCursorActionAnimationUpdateFunc = (
    skeletonMesh: threejsSpine.SkeletonMesh,
    actionAnimationConfig: ActionAnimation,
    skeletonData: threejsSpine.SkeletonData
  ): ((resetBonePosition?: boolean) => void) => {
    const TRACK_NUM = 1;
    const cursorBone = actionAnimationConfig?.boneName
      ? skeletonMesh.skeleton.findBone(actionAnimationConfig?.boneName)
      : null;
    if (!actionAnimationConfig?.animationName || !cursorBone || !skeletonMesh) {
      return;
    }

    skeletonMesh?.state.setAnimation(
      TRACK_NUM,
      actionAnimationConfig?.animationName,
      true
    );

    const boneData = skeletonData.bones.find(
      (item) => item.name === actionAnimationConfig?.boneName
    );
    const initCursorActionBonePositionX = boneData?.x ?? 0;
    const initCursorActionBonePositionY = boneData?.y ?? 0;

    const actionBoneUpdateCallback = (resetBonePosition?: boolean) => {
      //#region cursor follow animation
      const mainMesh = skeletonMesh.parent;
      if (mainMesh && cursorBone) {
        const cursorPositionInDom = new THREE.Vector3(cursorX, cursorY, 0);
        let cursoPositionInWorld = cursorPositionInDom.unproject(camera);
        cursoPositionInWorld = cursorPositionInDom
          .sub(camera.position)
          .normalize();
        cursoPositionInWorld = cursoPositionInWorld.multiplyScalar(
          (mainMesh.position.z - camera.position.z) / cursoPositionInWorld.z
        );

        const cursoPositionInSpine = cursoPositionInWorld.sub(
          new THREE.Vector3(
            mainMesh.position.x,
            mainMesh.position.y,
            mainMesh.position.z
          )
        );

        // use .parent !!! => http://en.esotericsoftware.com/forum/How-to-move-bone-17029
        const cursoPositionInBone = cursorBone.parent.worldToLocal(
          new threejsSpine.Vector2(
            cursoPositionInSpine.x,
            cursoPositionInSpine.y
          )
        );
        // the bone and its parent may not be fully ready at the start
        if (!isNaN(cursoPositionInBone.x) && !isNaN(cursoPositionInBone.y)) {
          const cursorMove = new THREE.Vector2(
            cursoPositionInBone.x - initCursorActionBonePositionX,
            cursoPositionInBone.y - initCursorActionBonePositionY
          );
          const cursorMoveDirection = cursorMove.clone().normalize();
          const cursorMoveDistance = cursorMove.clone().length();
          const maxFollowDistance =
            actionAnimationConfig?.maxFollowDistance ?? 100;

          const distanceAfterSlowDown = curosrMoveSlowDownFormula(
            cursorMoveDistance,
            maxFollowDistance
          );

          if (resetBonePosition) {
            cursorBone.x = initCursorActionBonePositionX;
            cursorBone.y = initCursorActionBonePositionY;
          } else {
            cursorBone.x =
              initCursorActionBonePositionX +
              distanceAfterSlowDown * cursorMoveDirection.x;
            cursorBone.y =
              initCursorActionBonePositionY +
              distanceAfterSlowDown * cursorMoveDirection.y;
          }
        }
      }
      //#endregion
    };

    return actionBoneUpdateCallback;
  };

  /**
   * start here
   */
  let lastFrameTime = Date.now() / 1000;
  let assetManager = new threejsSpine.AssetManager('./assets/');
  const meshUpdateCallbacks: Array<(delta: number) => void> = [];

  configs?.meshes?.forEach((meshConfig) => {
    // load scheleton
    if (meshConfig.skeletonFileName) {
      assetManager.loadBinary(meshConfig.skeletonFileName);
    } else if (meshConfig.jsonFileName) {
      assetManager.loadText(meshConfig.jsonFileName);
    } else {
      throw 'missing skeleton file';
    }
    // load atlas
    if (meshConfig.atlasFileName) {
      assetManager.loadTextureAtlas(meshConfig.atlasFileName);
    }
  });

  const waitLoad = () => {
    if (assetManager.isLoadingComplete()) {
      configs?.meshes?.forEach((meshConfig) => {
        // Add a box to the scene to which we attach the skeleton mesh
        const geometry = new THREE.BoxGeometry(100, 100, 100);
        const material = new THREE.MeshBasicMaterial({
          color: 0x000000,
          opacity: 0,
          alphaTest: 1,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          meshConfig?.position?.x ?? 0,
          meshConfig?.position?.y ?? 0,
          meshConfig?.position?.z ?? 0
        );
        scene.add(mesh);

        const atlas = assetManager.get(meshConfig.atlasFileName);
        const atlasLoader = new threejsSpine.AtlasAttachmentLoader(atlas);
        let skeletonJsonOrBinary:
          | threejsSpine.SkeletonJson
          | threejsSpine.SkeletonBinary;
        if (meshConfig.jsonFileName) {
          skeletonJsonOrBinary = new threejsSpine.SkeletonJson(atlasLoader);
        } else if (meshConfig.skeletonFileName) {
          skeletonJsonOrBinary = new threejsSpine.SkeletonBinary(atlasLoader);
        } else {
          throw 'please provide a skeleton file';
        }

        skeletonJsonOrBinary.scale = meshConfig.scale ?? 1;
        const skeletonData = skeletonJsonOrBinary.readSkeletonData(
          assetManager.get(
            meshConfig.jsonFileName ?? meshConfig.skeletonFileName
          )
        );

        // Create a SkeletonMesh from the data and attach it to the scene
        const skeletonMesh = new threejsSpine.SkeletonMesh(
          skeletonData,
          (parameters) => {
            parameters.depthTest = true;
            parameters.depthWrite = false;
          }
        );

        // set default animation on track 0
        skeletonMesh.state.setAnimation(0, meshConfig.animationName, true);

        // if the animation contains a cursor follow config, by default load the cursor follow animation
        let cursorActionAnimationUpdateFunc =
          generateCursorActionAnimationUpdateFunc(
            skeletonMesh,
            meshConfig?.cursorFollow,
            skeletonData
          );

        document.addEventListener(
          'mousedown',
          (event: MouseEvent) => {
            event.preventDefault();
            // reset previous bone position
            cursorActionAnimationUpdateFunc &&
              cursorActionAnimationUpdateFunc(true);
            // assign a new bone control function
            cursorActionAnimationUpdateFunc =
              generateCursorActionAnimationUpdateFunc(
                skeletonMesh,
                meshConfig?.cursorPress,
                skeletonData
              );
          },
          false
        );
        document.addEventListener(
          'mouseup',
          (event: MouseEvent) => {
            event.preventDefault();
            // reset previous bone position
            cursorActionAnimationUpdateFunc &&
              cursorActionAnimationUpdateFunc(true);
            // assign a new bone control function
            cursorActionAnimationUpdateFunc =
              generateCursorActionAnimationUpdateFunc(
                skeletonMesh,
                meshConfig?.cursorFollow,
                skeletonData
              );
          },
          false
        );

        mesh.add(skeletonMesh); // skeletonMesh.parent === mesh

        meshUpdateCallbacks.push(function (delta: number) {
          //#region cursor follow/press calculate new bone position
          cursorActionAnimationUpdateFunc && cursorActionAnimationUpdateFunc();
          //#endregion

          // the rest bone animation updates
          skeletonMesh.update(delta);
        });
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
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(waitLoad);
};

main();
