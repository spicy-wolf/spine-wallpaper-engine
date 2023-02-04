import * as THREE from 'three';
import * as threejsSpine from 'threejs-spine-3.8-runtime-es6';
import { Configs } from './config.type';

//#region BASIC SETUP
// Create an empty scene
const scene = new THREE.Scene();

// Create a basic perspective camera
const width = window.innerWidth,
  height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, width / height, 1, 3000);
camera.position.y = 0;
camera.position.z = 0;
// Create a renderer with Antialiasing
const renderer = new THREE.WebGLRenderer({ antialias: true });
// Configure renderer clear color
renderer.setClearColor('#000000');
// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);
// Append Renderer to DOM
document.body.appendChild(renderer.domElement);
//#endregion

//#region event register
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let mouseX: number = 0,
  mouseY: number = 0;
document.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event: MouseEvent) {
  // Update the mouse variable
  event.preventDefault();
  mouseX = (event.clientX / window.innerWidth) * 2;
  mouseY = -(event.clientY / window.innerHeight) * 2;
}
//#endregion

/**
 * start here
 */
let lastFrameTime = Date.now() / 1000;
let assetManager = new threejsSpine.AssetManager('./assets/');
let configs: Configs;
const spineMeshes: threejsSpine.SkeletonMesh[] = [];
const main = async () => {
  configs = await (await fetch('./assets/config.json')).json();

  configs.forEach((config) => {
    // load scheleton
    if (config.skeletonFileName) {
      assetManager.loadBinary(config.skeletonFileName);
    } else if (config.jsonFileName) {
      assetManager.loadText(config.jsonFileName);
    } else {
      throw 'missing skeleton file';
    }
    // load atlas
    if (config.atlasFileName) {
      assetManager.loadTextureAtlas(config.atlasFileName);
    }
  });

  requestAnimationFrame(waitLoad);

  // Create a Cube Mesh with basic material
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: '#433F81' });
  const cube = new THREE.Mesh(geometry, material);

  // Add cube to Scene
  scene.add(cube);
};

const waitLoad = () => {
  if (assetManager.isLoadingComplete()) {
    configs.forEach((config) => {
      // Add a box to the scene to which we attach the skeleton mesh
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        config?.position?.x ?? 0,
        config?.position?.y ?? 0,
        config?.position?.z ?? 0
      );
      scene.add(mesh);

      const atlas = assetManager.get(config.atlasFileName);
      const atlasLoader = new threejsSpine.AtlasAttachmentLoader(atlas);
      let skeletonJsonOrBinary:
        | threejsSpine.SkeletonJson
        | threejsSpine.SkeletonBinary;
      if (config.jsonFileName) {
        skeletonJsonOrBinary = new threejsSpine.SkeletonJson(atlasLoader);
      } else {
        skeletonJsonOrBinary = new threejsSpine.SkeletonBinary(atlasLoader);
      }

      skeletonJsonOrBinary.scale = config.scale ?? 1;
      const skeletonData = skeletonJsonOrBinary.readSkeletonData(
        assetManager.get(config.skeletonFileName)
      );

      // Create a SkeletonMesh from the data and attach it to the scene
      const skeletonMesh = new threejsSpine.SkeletonMesh(
        skeletonData,
        (parameters) => {
          parameters.depthTest = true;
        }
      );

      skeletonMesh.state.setAnimation(0, config.animationName, true);
      mesh.add(skeletonMesh);
      spineMeshes.push(skeletonMesh);
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
  spineMeshes.forEach((mesh) => mesh.update(delta));
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

main();
