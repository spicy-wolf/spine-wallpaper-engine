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

import THREE from 'three';
import { Configs } from './config.type';

export let scene: THREE.Scene = null;
export let renderer: THREE.WebGLRenderer = null;
export let cursorX: number = 0;
export let cursorY: number = 0;
export let camera: THREE.PerspectiveCamera = null;

export const initScene = (configs: Configs) => {
  const width = configs.width ?? 2048;
  const height = configs.height ?? 2048;

  //#region BASIC SETUP
  // Create an empty scene
  scene = new THREE.Scene();

  // Create a basic perspective camera
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 5000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  // Create a renderer with Antialiasing
  renderer = new THREE.WebGLRenderer({ antialias: true });
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

  document.addEventListener('mousemove', onMouseMove, false);
  function onMouseMove(event: MouseEvent) {
    // Update the mouse variable
    event.preventDefault();
    cursorX = (event.clientX / width) * 2 - 1;
    cursorY = -(event.clientY / height) * 2 + 1;
  }
  //#endregion
};
