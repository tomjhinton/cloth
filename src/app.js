const CANNON = require('cannon')
const THREE = require('three')
import './debug.js'
import './style.scss'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

var dt = 1/60, R = 0.2;
let plane2
            var clothMass = 1;  // 1 kg in total
            var clothSize = 1; // 1 meter
            var Nx = 24;
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


            var container, stats;
            var camera, scene, renderer;

            var sphereMesh, sphereBody;
            var particles = [];
            var world;

            initCannon();
            init();
            animate();

            function initCannon(){
                world = new CANNON.World();
                world.broadphase = new CANNON.NaiveBroadphase();
                world.gravity.set(0,-9.82,0);
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
                var sphereShape = new CANNON.Sphere(ballSize*0.3);
                sphereBody = new CANNON.Body({
                    mass: 3
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




                // lights
                var light, materials;
                scene.add( new THREE.AmbientLight( 0x666666 ) );

                light = new THREE.DirectionalLight( 0xffffff, 1.75 );
                var d = 5;

                light.position.set( d, d, d );

                light.castShadow = true;
                //light.shadowCameraVisible = true;



                scene.add( light );







                // sphere
                var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
                var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x888888 } );

                sphereMesh = new THREE.Mesh( ballGeo, ballMaterial );
                sphereMesh.castShadow = true;
                //sphereMesh.receiveShadow = true;
                // scene.add( sphereMesh );


 renderer = new THREE.WebGLRenderer( {alpha: true } );                renderer.setSize( window.innerWidth, window.innerHeight );

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

              var texture = new THREE.TextureLoader().load( 'assets/test.png' );
            var geometry = new THREE.PlaneGeometry( 2, 1, 24, 12 );
            var material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide, map: texture} );
            plane2 = new THREE.Mesh( geometry, material );
            plane2.matrixWorldNeedsUpdate = true
            plane2.elementsNeedUpdate = true
            plane2.verticesNeedUpdate = true
            scene.add( plane2 );

            console.log(scene)
            function animate() {

                requestAnimationFrame( animate );
                // controls.update();
                world.step(dt);
                var t = world.time;
                sphereBody.position.set(R * Math.sin(t), 0, R * Math.cos(t));
                render();


            }

            function render() {




                for ( var i = 0, il = Nx+1; i !== il; i++ ) {
                    for ( var j = 0, jl = Ny+1; j !== jl; j++ ) {
                        var idx = j*(Nx+1) + i;

                        if(geometry&&  geometry.vertices[idx] ){
                        geometry.vertices[idx].copy(particles[i][j].position);
                        geometry.elementsNeedUpdate = true
                        geometry.verticesNeedUpdate = true
                      }
                    }
                }


                if(plane2){

                plane2.elementsNeedUpdate = true
                plane2.verticesNeedUpdate = true
                plane2.matrixWorldNeedsUpdate = true
              }


                sphereMesh.position.copy(sphereBody.position);
                if(cannonDebugRenderer){
    // cannonDebugRenderer.update()
  }
                renderer.render( scene, camera );

            }
