// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
import ProfiledContourGeometry from "./ProfiledContourGeometry";
const random = require('canvas-sketch-util/random');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  duration: 30,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

let colors = [
  "#f8b22a",
  "#ea4631",
  "#bb2428",
]
let colors1 = [
  "#155b33",
  "#155b33",
  "#155b33",
  "#155b33",
  "#146b3b",
  "#146b3b",
  "#146b3b",
  "#146b3b",
  "#146b3b",
  "#f8b22a",
  "#ea4631",
  "#bb2428",
]
colors = colors.map(c => new THREE.Color(c));
colors1 = colors1.map(c => new THREE.Color(c));

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 10000);
  camera.position.set(0, -5, 5);
/*   camera.lookAt(new THREE.Vector3(0,0,0));
 */
  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  /*  const geometry = new THREE.SphereGeometry(1, 32, 16); */

  // Creaction de la Shape de la forme
  let maxNumPoints = 150;
  let width = 3*0.1;
  let height = 0.1;
  let shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, width);
  shape.lineTo(height, width);
  shape.lineTo(height, 0);
  shape.lineTo(0, 0);

  // Creation du contour
  let detail = 100;
  let rings = []

  let contour = []

  for (let i = 0; i < detail; i++) {
    let angle = 2*Math.PI*i/detail;
    contour.push(
      new THREE.Vector2(
        Math.sin(angle),
        Math.cos(angle)
      )
    );
  }

  let CG = new ProfiledContourGeometry(shape, contour, true, true);
  let material = new THREE.MeshLambertMaterial({
    color: 0x00ff00,
  });

  function getMesh(index) {
    let ball = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.2, 20, 20),
      new THREE.MeshLambertMaterial({
        color: random.pick(colors),
      })
    );
    let mesh = new THREE.Mesh(
      CG, 
      material.clone()
      );
      let theta = Math.random()*2*Math.PI;
      ball.position.x = 1.2*Math.sin(theta);  
      ball.position.y = 1.2*Math.cos(theta);
      ball.position.z = 0.3;
      // mesh.position.z = index/2;
      mesh.add(ball);
      rings.push(mesh);

      mesh.material.color = random.pick(colors1);

      return mesh;
  }

  // Creation de la géométrie

  for (let i = 0; i < maxNumPoints; i++) {
    let mesh = getMesh(i);
    scene.add(mesh);
  }

  // Setup a mesh with geometry + material
 /*  const mesh = new THREE.Mesh(CG, material);
  scene.add(mesh); */

  scene.add(new THREE.AmbientLight("#ccccccc"));
  let light = new THREE.DirectionalLight("#0xffffff", 1);
  light.position.set(50, 50, 50);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, playhead }) {

      rings.forEach((ring, index) => {
        let progress = (- playhead + 2 + index/maxNumPoints)%1;
        ring.position.z = progress*maxNumPoints/10

        let scale = 1.04**(maxNumPoints - 4 * progress*maxNumPoints);
        ring.scale.set(scale, scale, scale);
      });
      scene.position.z = -3
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
