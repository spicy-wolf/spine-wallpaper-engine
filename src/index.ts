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
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0;
// Create a renderer with Antialiasing
const renderer = new THREE.WebGLRenderer({ antialias: true });
// Configure renderer clear color
renderer.setClearColor('#000000');
// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);
// Append Renderer to DOM
const canvasElement = renderer.domElement;
document.body.appendChild(canvasElement);
//#endregion

//#region event register
//window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let cursorX: number = 0,
  cursorY: number = 0;
document.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event: MouseEvent) {
  // Update the mouse variable
  event.preventDefault();
  cursorX = (event.clientX / window.innerWidth) * 2 - 1;
  cursorY = -(event.clientY / window.innerHeight) * 2 + 1;
}
//#endregion

/**
 * start here
 */
let lastFrameTime = Date.now() / 1000;
let assetManager = new threejsSpine.AssetManager('./assets/');
let configs: Configs;
const meshUpdateCallbacks: Array<(delta: number) => void> = [];
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
};

const waitLoad = () => {
  if (assetManager.isLoadingComplete()) {
    configs.forEach((config) => {
      // Add a box to the scene to which we attach the skeleton mesh
      const geometry = new THREE.BoxGeometry(100, 100, 100);
      const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
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
          parameters.depthWrite = false;
        }
      );

      // set default animation on track 0
      skeletonMesh.state.setAnimation(0, config.animationName, true);

      // if the animation contains a cursor follow config, then add it to track 1
      const cursorFollowBone = config.cursorFollow?.boneName
        ? skeletonMesh.skeleton.findBone(config.cursorFollow?.boneName)
        : null;
      if (config.cursorFollow?.animationName && cursorFollowBone) {
        skeletonMesh.state.setAnimation(
          1,
          config.cursorFollow?.animationName,
          true
        );
      }
      mesh.add(skeletonMesh);

      const initCursorFollowBonePositonX = cursorFollowBone.x;
      const initCursorFollowBonePositonY = cursorFollowBone.y;

      meshUpdateCallbacks.push(function (delta: number) {
        //#region cursor follow animation
        const cursorPositionInDom = new THREE.Vector3(cursorX, cursorY, 0);
        let cursoPositionInWorld = cursorPositionInDom.unproject(camera);
        cursoPositionInWorld = cursorPositionInDom
          .sub(camera.position)
          .normalize();
        cursoPositionInWorld = cursoPositionInWorld.multiplyScalar(
          (mesh.position.z - camera.position.z) / cursoPositionInWorld.z
        );

        const cursoPositionInSpine = cursoPositionInWorld.sub(
          new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z)
        );

        // use .parent !!! => http://en.esotericsoftware.com/forum/How-to-move-bone-17029
        const cursoPositionInBone = cursorFollowBone.parent.worldToLocal(
          new threejsSpine.Vector2(
            cursoPositionInSpine.x,
            cursoPositionInSpine.y
          )
        );
        let cursorMoveDirection = new THREE.Vector2(
          cursoPositionInBone.x - initCursorFollowBonePositonX,
          cursoPositionInBone.y - initCursorFollowBonePositonY
        );
        const maxFollowDistance = config.cursorFollow?.maxFollowDistance ?? 80;
        if (cursorMoveDirection.length() <= maxFollowDistance) {
          cursorFollowBone.x = cursoPositionInBone.x;
          cursorFollowBone.y = cursoPositionInBone.y;
        } else {
          cursorMoveDirection = cursorMoveDirection.normalize();
          cursorFollowBone.x =
            initCursorFollowBonePositonX +
            cursorMoveDirection.x * maxFollowDistance;
          cursorFollowBone.y =
            initCursorFollowBonePositonY +
            cursorMoveDirection.y * maxFollowDistance;
        }
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

main();
