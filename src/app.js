const CANNON = require('cannon')
const THREE = require('three')
import './debug.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

var dt = 1/60, R = 0.2;
let particleSystem
            var clothMass = 1;  // 1 kg in total
            var clothSize = 1; // 1 meter
            var Nx = 12;
            var Ny = 12;
            var mass = clothMass / Nx*Ny;

            var restDistance = clothSize/Nx;

            var ballSize = 0.1
            let  vect = new THREE.Vector3( 0, 0, 0 )
            var clothFunction = plane(restDistance * Nx, restDistance * Ny, vect);

            function plane(width, height, vector) {

                return function(u, v, vect) {
                  vect = new THREE.Vector3( 0, 0, 0 )
                    var x = (u-0.5) * width;
                    var y = (v+0.5) * height;
                    var z = 0;
                    return vect.set( x, y, z );
                };
            }

            function randomMat(){
              return new THREE.PointsMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.2, size: 5.3,
                transparent: true } )
            }

            var container, stats;
            var camera, scene, renderer;

            var clothGeometry;
            var sphereMesh, sphereBody;
            var object;
            var particles = [];
            var world;

            initCannon();
            init();
            animate();

            function initCannon(){
                world = new CANNON.World();
                world.broadphase = new CANNON.NaiveBroadphase();
                world.gravity.set(2,-9.82,0);
                world.solver.iterations = 20;

                // Materials
                var clothMaterial = new CANNON.Material();
                var sphereMaterial = new CANNON.Material();
                var clothSphereContactMaterial = new CANNON.ContactMaterial(  clothMaterial,
sphereMaterial,
0.0, // friction coefficient
0.0  // restitution
);
                // Adjust constraint equation parameters for ground/ground contact
                clothSphereContactMaterial.contactEquationStiffness = 1e9;
                clothSphereContactMaterial.contactEquationRelaxation = 3;

                // Add contact material to the world
                world.addContactMaterial(clothSphereContactMaterial);

                // Create sphere
                var sphereShape = new CANNON.Sphere(ballSize*1.3);
                sphereBody = new CANNON.Body({
                    mass: 1
                });
                sphereBody.addShape(sphereShape);
                sphereBody.position.set(0,0,0);
                world.addBody(sphereBody);

                // Create cannon particles
                for ( var i = 0, il = Nx+1; i !== il; i++ ) {
                    particles.push([]);
                    for ( var j = 0, jl = Ny+1; j !== jl; j++ ) {
                        var idx = j*(Nx+1) + i;
                        var p = clothFunction(i/(Nx+1), j/(Ny+1));
                        var particle = new CANNON.Body({
                            mass: j==Ny ? 0 : mass
                        });
                        particle.addShape(new CANNON.Particle());
                        particle.linearDamping = 0.5;
                        particle.position.set(
                            p.x,
                            p.y-Ny * 0.9 * restDistance,
                            p.z
                        );
                        particles[i].push(particle);
                        world.addBody(particle);
                        particle.velocity.set(0,0,-0.5*(Ny-j));
                    }
                }
                function connect(i1,j1,i2,j2){
                    world.addConstraint( new CANNON.DistanceConstraint(particles[i1][j1],particles[i2][j2],restDistance) );
                }
                for(var i=0; i<Nx+1; i++){
                    for(var j=0; j<Ny+1; j++){
                        if(i<Nx) connect(i,j,i+1,j);
                        if(j<Ny) connect(i,j,i,j+1);
                    }
                }
            }

            function init() {

                container = document.createElement( 'div' );
                document.body.appendChild( container );

                // scene

                scene = new THREE.Scene();

                scene.fog = new THREE.Fog( 0x000000, 500, 10000 );

                // camera

                camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 );

                camera.position.set(Math.cos( Math.PI/4 ) * 3,
                                    0,
                                    Math.sin( Math.PI/4 ) * 3);

                scene.add( camera );


                // Controls
                // controls = new THREE.TrackballControls( camera );
                //
                // controls.rotateSpeed = 1.0;
                // controls.zoomSpeed = 1.2;
                // controls.panSpeed = 0.8;
                //
                // controls.noZoom = false;
                // controls.noPan = false;
                //
                // controls.staticMoving = true;
                // controls.dynamicDampingFactor = 0.3;
                //
                // controls.keys = [ 65, 83, 68 ];
                //

                // lights
                var light, materials;
                scene.add( new THREE.AmbientLight( 0x666666 ) );

                light = new THREE.DirectionalLight( 0xffffff, 1.75 );
                var d = 5;

                light.position.set( d, d, d );

                light.castShadow = true;
                //light.shadowCameraVisible = true;



                scene.add( light );

                /*
                light = new THREE.DirectionalLight( 0xffffff, 0.35 );
                light.position.set( 0, -1, 0 );
                scene.add( light );
                */

                // cloth material

                var clothTexture = THREE.TextureLoader( 'assets/tom.png' ); // circuit_pattern.png
                var texture = new THREE.TextureLoader().load( 'assets/tom.png' );
                var particleCount = 169,
    particles = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 1.3,
      map: texture
    });
// now create the individual particles
for (var p = 0; p < particleCount; p++) {

  // create a particle with random
  // position values, -250 -> 250
  var pX = Math.random() * 500 - 250,
      pY = Math.random() * 500 - 250,
      pZ = Math.random() * 500 - 250,
      particle =
        new THREE.Vector3(pX, pY, pZ)
      ;

  // add it to the geometry
  particles.vertices.push(particle);
}

// create the particle system
 particleSystem = new THREE.ParticleSystem(
    particles,
    randomMat());

    particleSystem.geometry.normalsNeedUpdate = true;
    particleSystem.geometry.verticesNeedUpdate = true;
    particleSystem.matrixWorldNeedsUpdate = true
    particleSystem.elementsNeedUpdate = true;
// add it to the scene
//console.log(particleSystem)
scene.add(particleSystem);


                var clothMaterial = new THREE.MeshPhongMaterial( {
                    alphaTest: 0.5,
                    ambient: 0x000000,
                    color: 0xffffff,
                    specular: 0x333333,
                    emissive: 0x222222,
                    //shininess: 5,
                    // map: clothTexture,
                    side: THREE.DoubleSide
                } );

                // cloth geometry
                clothGeometry = new THREE.ParametricGeometry( clothFunction, Nx, Ny, true );
                clothGeometry.dynamic = true;
                clothGeometry.computeFaceNormals();

                // cloth mesh
                object = new THREE.Mesh(clothGeometry, clothMaterial);
                object.position.set(0, 0, 0);
                object.castShadow = true;
                //object.receiveShadow = true;
                scene.add( object );

                // sphere
                var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
                var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );

                sphereMesh = new THREE.Mesh( ballGeo, ballMaterial );
                sphereMesh.castShadow = true;
                //sphereMesh.receiveShadow = true;
                // scene.add( sphereMesh );


                renderer = new THREE.WebGLRenderer( { antialias: true } );
                renderer.setSize( window.innerWidth, window.innerHeight );
                renderer.setClearColor( scene.fog.color );

                container.appendChild( renderer.domElement );



                window.addEventListener( 'resize', onWindowResize, false );

                camera.lookAt( sphereMesh.position );
            }

            //

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                // controls.handleResize();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }
            const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
            var controls = new OrbitControls( camera, renderer.domElement );


            var geometry = new THREE.PlaneBufferGeometry( 1, 1, 12, 12 );
            var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
            var plane2 = new THREE.Mesh( geometry, material );
            console.log(plane2)
            scene.add( plane2 );



            function animate() {
                requestAnimationFrame( animate );
                // controls.update();
                world.step(dt);
                var t = world.time;
                sphereBody.position.set(R * Math.sin(t), 0, R * Math.cos(t));
                render();
            }
            clothGeometry.computeFaceNormals();
            clothGeometry.computeVertexNormals();
            clothGeometry.elementsNeedUpdate = true
            clothGeometry.verticesNeedUpdate = true
            console.log(clothGeometry)
            //console.log(particles)
            function render() {

              clothGeometry.computeFaceNormals();
              clothGeometry.computeVertexNormals();

              clothGeometry.normalsNeedUpdate = true;
              clothGeometry.verticesNeedUpdate = true;
                for ( var i = 0, il = Nx+1; i !== il; i++ ) {
                    for ( var j = 0, jl = Ny+1; j !== jl; j++ ) {
                        var idx = j*(Nx+1) + i;
                        if(  particleSystem.geometry.vertices[idx]){
                        particleSystem.geometry.vertices[idx].copy(particles[i][j].position);
                        // clothGeometry.attributes.position[idx].copy(particles[i][j].position)
                      }
                    }
                }

                clothGeometry.computeFaceNormals();
                clothGeometry.computeVertexNormals();

                particleSystem.geometry.normalsNeedUpdate = true;
                particleSystem.geometry.verticesNeedUpdate = true;
                particleSystem.matrixWorldNeedsUpdate = true
                particleSystem.elementsNeedUpdate = true;
                // particleSystem.rotation.x+=0.01
                sphereMesh.position.copy(sphereBody.position);
                if(cannonDebugRenderer){
    cannonDebugRenderer.update()
  }
  // console.log(particles[0][2].position)
  // console.log(particleSystem.geometry.vertices[15])
                renderer.render( scene, camera );

            }
