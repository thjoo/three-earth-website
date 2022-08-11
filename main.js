import gsap from "gsap";
import * as THREE from "three";
import { Float32BufferAttribute } from "three";

import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl?raw";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl?raw";

import starsVertexShader from "./shaders/stars/vertex.glsl?raw";
import starsFragmentShader from "./shaders/stars/fragment.glsl?raw";

const canvas = document.querySelector("canvas");

const textureLoader = new THREE.TextureLoader();

const radius = 6371;

const sizes = {
  width: innerWidth,
  height: innerHeight,
};

addEventListener("resize", () => {
  // update sizes
  sizes.width = innerWidth;
  sizes.height = innerHeight;

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update stars
  starMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  );
});

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
});
// Setting the size of the renderer to full width and heigt, then appending to dom
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.00000025);

const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  50,
  1000000
);
camera.position.z = radius * 9;

// Lights
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(-1, 0, 1).normalize();
scene.add(dirLight);

// Earth
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(radius, 50, 50),
  new THREE.MeshPhongMaterial({
    specular: 0x333333,
    shininess: 5,
    map: textureLoader.load("/earth_atmos_2048.jpeg"),
    specularMap: textureLoader.load("earth_specular_2048.jpeg"),
    normalMap: textureLoader.load("/earth_normal_2048.jpeg"),

    // y scale is negated to compensate for normal map handedness.
    normalScale: new THREE.Vector2(0.85, -0.85),
  })
);

// Clouds
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(radius, 50, 50),
  new THREE.MeshLambertMaterial({
    map: textureLoader.load("/earth_clouds_1024.png"),
    transparent: true,
  })
);
clouds.scale.set(1.005, 1.005, 1.005);

// Create atmosphere outside
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(radius, 50, 50),
  new THREE.ShaderMaterial({
    // color: 0xff0000,
    // map: new THREE.TextureLoader().load("./img/globe.png"),
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);

atmosphere.scale.set(1.105, 1.105, 1.105);
scene.add(atmosphere);

const group = new THREE.Group();
group.add(sphere, clouds);
scene.add(group);

// const starGeometry = new THREE.BufferGeometry();
// const starMaterial = new THREE.PointsMaterial({
//   color: 0xffffff,
// });

// const starVertecies = [];

// for (let i = 0; i < 1000; i++) {
//   const x = (Math.random() - 0.5) * 2000;
//   const y = (Math.random() - 0.5) * 2000;
//   const z = -Math.random() * 1500;
//   starVertecies.push(x, y, z);
// }

// starGeometry.setAttribute(
//   "position",
//   new THREE.Float32BufferAttribute(starVertecies, 3)
// );

// const stars = new THREE.Points(starGeometry, starMaterial);

// scene.add(stars);

// Stars
const starsGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const positionArray = new Float32Array(starCount * 3);
const scaleArray = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  positionArray[i * 3 + 1] = (Math.random() - 0.5) * 450000;
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 450000;
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 450000;

  scaleArray[i] = Math.random();
}

starsGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3)
);
starsGeometry.setAttribute("aScale", new THREE.BufferAttribute(scaleArray, 1));

const starMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 1500000 },
  },
  vertexShader: starsVertexShader,
  fragmentShader: starsFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const stars = new THREE.Points(starsGeometry, starMaterial);
scene.add(stars);

const mouse = {
  x: 0,
  y: 0,
};

// Time
// let time = Date.now();
const clock = new THREE.Clock();

// Animations
const tick = () => {
  // Time
  const elapsedTime = clock.getElapsedTime();
  // const currentTime = Date.now();
  // const deltaTime = currentTime - time;
  // time = currentTime;

  requestAnimationFrame(tick);

  // Controls
  // controls.update();

  // Render
  renderer.render(scene, camera);

  //Update objects
  sphere.rotation.y = elapsedTime * 0.16;
  clouds.rotation.y = 1.4 * elapsedTime * 0.16;
  gsap.to(group.rotation, {
    x: -mouse.y * 0.5,
    y: mouse.x * 0.5,
    duration: 2,
  });
};

tick();

addEventListener("mousemove", () => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
