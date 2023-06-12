import './style.css'
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

let textMesh, pControl, scene, camera, renderer, clock, direction_light, portalLight, portalLight1, starGeo, stars, vertices;
vertices = {
  positions: [],
  accelerations: [],
  velocities: [],
};
let portalParticles = [], smokeParticles = [];

// Obtén la referencia al elemento .text-box
const textBox = document.querySelector('.text-box');

// Oculta el .text-box inicialmente
textBox.style.display = 'none';

// Mostrar el .text-box cuando las estrellas estén listas
function showTextBox() {
  textBox.style.display = 'block';
}

function initScene() {
  scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 0, 8000);
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 1000;

  // Set up the scene lights
  direction_light = new THREE.DirectionalLight(0xffffff, 0.2);
  direction_light.position.set(0, 0, 1);
  scene.add(direction_light);

  portalLight1 = new THREE.PointLight(0xffffff, 4, 0, 2);
  portalLight1.position.set(0, 0, 100);
  scene.add(portalLight1);

  portalLight = new THREE.PointLight(0x062d89, 100, 450, 1.7);
  portalLight.position.set(0, 0, 250);
  scene.add(portalLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight - 2);
  //renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);
  particleSetup();
}

function particleSetup() {
  let portalLoader = new THREE.TextureLoader();

  portalLoader.load("/humo3.png", function (texture) {
    let portalGeo = new THREE.PlaneGeometry(200, 200);
    let portalMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true
    });

    let smokeGeo = new THREE.PlaneGeometry(700, 700);
    let smokeMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true
    });

    for (let index = 945; index > 140; index--) {
      let particle = new THREE.Mesh(portalGeo, portalMaterial);
      particle.position.set(
        0.5 * index * Math.cos((4 * index * Math.PI) / 180),
        0.5 * index * Math.sin((4 * index * Math.PI) / 180),
        0.1 * index
      );
      particle.rotation.z = Math.random() * 360;
      portalParticles.push(particle);
      scene.add(particle);


    }
    for (let index = 0; index < 40; index++) {
      let particle = new THREE.Mesh(smokeGeo, smokeMaterial);
      particle.position.set(
        Math.random() * 1000 - 500,
        Math.random() * 800 - 500,
        25
      );
      particle.rotation.z = Math.random() * 360;
      particle.material.opacity = 0.2;
      smokeParticles.push(particle);
      scene.add(particle);
    }
    clock = new THREE.Clock();
  });

}
initScene();

const loader = new FontLoader();

loader.load('https://threejs.org/examples/fonts/optimer_regular.typeface.json', function (font) {

  const textGeometry = new TextGeometry('MARTIN ECHEVERRIA', {
    font: font,
    size: 12,
    height: 1
  });
  const textMaterial = new THREE.MeshLambertMaterial({ color: 0x6CB8F3 });
  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  //textMesh.position.set(-52.5, 0, 950);
  scene.add(textMesh);

  const textTween = new TWEEN.Tween({ x: getPositionCenter(textMesh), y: 0, z: -150 })
    .to({ x: getPositionCenter(textMesh), y: 0, z: 950 }, 3000)
    .easing(TWEEN.Easing.Bounce.Out);

  const updateMovimiento = (object) => {
    textMesh.position.set(object.x, object.y, object.z)
  };

  textTween.onUpdate(updateMovimiento);

  textTween.start();
});

function getPositionCenter(objectMesh) {
  // Access the geometry of the Mesh object
  const geometry = objectMesh.geometry;

  // Get the bounds of the object based on its geometry
  geometry.computeBoundingBox();

  // Get the object's width in the X-axis
  const sizeX = geometry.boundingBox.max.x - geometry.boundingBox.min.x;

  // Calculate the X position to center the object
  return (-sizeX / 2);
}

function enterPortal() {
  const cameraTween = new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z })
    .to({ x: camera.position.x, y: camera.position.y, z: -1000 }, 4000)
    .easing(TWEEN.Easing.Quadratic.In);

  let updateMovimiento = (object) => {
    camera.position.set(object.x, object.y, object.z);
    camera.rotation.z += 0.002;
  };

  cameraTween.onUpdate(updateMovimiento);

  cameraTween.start();
  initStar();
}

window.addEventListener('resize', onWindowResize);
window.addEventListener('click', enterPortal);

function initStar() {
  starGeo = new THREE.BufferGeometry(); // Crea una BufferGeometry vacía

  for (let i = 0; i < 3000; i++) {
    vertices.positions.push(
      Math.random() * 800 - 400,
      Math.random() * 800 - 400,
      Math.random() * -1500);
    if (i % 3 === 0) {
      vertices.accelerations.push(0);
      vertices.velocities.push(.2);
    }
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices.positions), 3));

  let sprite = new THREE.TextureLoader().load('sprite.png');
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.7,
    map: sprite,
    transparent: true
  });

  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);

  setTimeout(function() {
    showTextBox();
  }, 4000);
  
}

function animate() {
  TWEEN.update();
  requestAnimationFrame(animate);

  let delta = clock.getDelta();
  portalParticles.forEach(p => {
    p.rotation.z -= delta * 1.5;
  });
  smokeParticles.forEach(p => {
    p.rotation.z -= delta * 0.2;
  });

  if (Math.random() > 0.9)
    portalLight.power = 350 + Math.random() * 500;

  //camera.lookAt(space.position);
  renderer.render(scene, camera);
}
animate();


if (WebGL.isWebGLAvailable()) {
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById('containerLeft').appendChild(warning);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}


