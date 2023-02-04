import * as THREE from 'three';
import * as threejsSpine from 'threejs-spine-3.8-runtime-es6';
import { Configs } from './config.type';
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
        } else {
          skeletonJsonOrBinary = new threejsSpine.SkeletonBinary(atlasLoader);
        }

        skeletonJsonOrBinary.scale = meshConfig.scale ?? 1;
        const skeletonData = skeletonJsonOrBinary.readSkeletonData(
          assetManager.get(meshConfig.skeletonFileName)
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

        // if the animation contains a cursor follow config, then add it to track 1
        const cursorFollowBone = meshConfig.cursorFollow?.boneName
          ? skeletonMesh.skeleton.findBone(meshConfig.cursorFollow?.boneName)
          : null;
        if (meshConfig.cursorFollow?.animationName && cursorFollowBone) {
          skeletonMesh.state.setAnimation(
            1,
            meshConfig.cursorFollow?.animationName,
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
          // the bone and its parent may not be fully ready at the start
          if (!isNaN(cursoPositionInBone.x) && !isNaN(cursoPositionInBone.y)) {
            const cursorMove = new THREE.Vector2(
              cursoPositionInBone.x - initCursorFollowBonePositonX,
              cursoPositionInBone.y - initCursorFollowBonePositonY
            );
            const cursorMoveDirection = cursorMove.clone().normalize();
            const cursorMoveDistance = cursorMove.clone().length();
            const maxFollowDistance =
              meshConfig.cursorFollow?.maxFollowDistance ?? 100;

            const distanceAfterSlowDown = curosrMoveSlowDownFormula(
              cursorMoveDistance,
              maxFollowDistance
            );
            cursorFollowBone.x =
              initCursorFollowBonePositonX +
              distanceAfterSlowDown * cursorMoveDirection.x;
            cursorFollowBone.y =
              initCursorFollowBonePositonY +
              distanceAfterSlowDown * cursorMoveDirection.y;
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

  requestAnimationFrame(waitLoad);
};

main();
