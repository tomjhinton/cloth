const CANNON = require('cannon')
const THREE = require('three')

const scene = new THREE.Scene()

const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 40, 25, 10 )
light.castShadow = true
scene.add(light)

let size = 8
let geometry = new THREE.PlaneBufferGeometry(10, 10, size, size)
let mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0xFF0000}))
scene.add(mesh)
var geometry2 = new THREE.PlaneBufferGeometry(10, 10, size, size)
var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry2, material );
scene.add( plane );

import './debug.js'

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )
//var controls = new OrbitControls( camera, renderer.domElement );


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 3000 )

camera.position.z = mesh.position.z+ 50


const timeStep=1/60
const world = new CANNON.World()
world.gravity.set(0,-5,0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10
let mass = 10
let  stitches = []
function createStitches() {
    // We don't want a sphere nor a cube for each point of our cloth. Cannon provides the Particle() object, a shape with ... no shape at all!
    const particleShape = new CANNON.Particle();

    const { position } = geometry.attributes;
    const { x: width, y: height } = size;

    stitches = []

    for (let i = 0; i < position.count; i++) {

      const pos = new CANNON.Vec3(
        position.getX(i) * width,
        position.getY(i) * height,
        position.getZ(i)
      );

      const stitch = new CANNON.Body({

        // We divide the mass of our body by the total number of points in our mesh. This way, an object with a lot of vertices doesn’t have a bigger mass.
        mass: mass / position.count,

        // Just for a smooth rendering, you can drop this line but your cloth will move almost infinitely.
        linearDamping: 0.8,

        position: pos,
        shape: particleShape,

        // TEMP, we’ll delete later
        velocity: new CANNON.Vec3(0, 0, -300)
      });

      stitches.push(stitch);
      world.addBody(stitch);
    }
}

createStitches()
const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )

function update() {


  renderer.render(scene,camera)
  requestAnimationFrame(animate)
      const { position } = geometry.attributes;
      const { x: width, y: height } = size;

      for (let i = 0; i < position.count; i++) {
        position.setXYZ(
          i,
          stitches[i].position.x / width,
          stitches[i].position.y / height,
          stitches[i].position.z
        );
      }

      position.needsUpdate = true;

      if(cannonDebugRenderer){
          cannonDebugRenderer.update()
        }


  updatePhysics()

}









function animate() {


  update()






}




function updatePhysics() {
  // Step the physics world
  world.step(timeStep)


}


requestAnimationFrame(animate)
