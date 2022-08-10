import gsap from "gsap";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";
import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl?raw";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl?raw";
import { Float32BufferAttribute } from "three";

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio), 2);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("canvas"),
});

// Setting the size of the renderer to full width and heigt, then appending to dom
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// Create a sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    // color: 0xff0000,
    // map: new THREE.TextureLoader().load("./img/globe.png"),
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load("./public/globe.png"),
      },
    },
  })
);

// Create atmosphere (copy of sphere)
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    // color: 0xff0000,
    // map: new THREE.TextureLoader().load("./img/globe.png"),
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);

atmosphere.scale.set(1.1, 1.1, 1.1);

scene.add(atmosphere);

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});

const starVertecies = [];

for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 1500;
  starVertecies.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertecies, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);

scene.add(stars);

camera.position.z = 15;

const mouse = {
  x: undefined,
  y: undefined,
};

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  sphere.rotation.y += 0.003;
  gsap.to(group.rotation, {
    x: -mouse.y * 0.5,
    y: mouse.x * 0.5,
    duration: 2,
  });
}
animate();

addEventListener("mousemove", () => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
