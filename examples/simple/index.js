'use strict'

var createGame = require('voxel-engine')
var textures = require('painterly-textures')

var game = createGame({
	generate: function(x, y, z) {
    //if (y == -1) return 1
    //if (y < 0 && y > -5 && x < 10 && x > 0 && z < 10 && z > 0) return 0
    var val = y + 3 * Math.sin(x / 4)
    if (val < -1 && val > -5) return 1
    //if (z = 0 && y <= 1) return 6
		return 0
	},
	texturePath: '../../node_modules/painterly-textures/textures/',
  chunkSize: 16,
  chunkDistance: 1,
})

game.gravity = [0, -0.98, 0]


var Physics = require('../../')
var physi = window.physi = Physics(game)

var groundShape = new physi.CANNON.Plane();
var groundBody = new physi.CANNON.RigidBody(0, groundShape);
groundBody.quaternion.setFromAxisAngle(new physi.CANNON.Vec3(-1,0,0),Math.PI/2);
groundBody.position.set(0,-5,0);
//groundBody.quaternion.set(1, 0, 1, 0)


physi.world.add(groundBody);

window.launch = launch
document.body.onmousedown = launch

function createBox() {
  var material = game.materials.get('brick')
  var mesh = new game.THREE.Mesh(
    new game.THREE.CubeGeometry(1,10,1),
    new game.THREE.MeshFaceMaterial(material)
  )
  mesh.useQuaternion = true;
  return mesh
}

function launch() {
  var CANNON = physi.CANNON
  // Box
  var boxShape = new CANNON.Box(new CANNON.Vec3(0.5,5,0.5));
  var b1 = new CANNON.RigidBody(5, boxShape);

  var position = game.camera.position.clone()
  b1.position.set(position.x, position.y, position.z);
  b1.velocity.set(0,0.5,0);
  b1.angularVelocity.set(Math.random(), Math.random(), Math.random())
  b1.linearDamping=0.01;
  b1.angularDamping=0.01;

  //b1.allowSleep = false;

  // Sleep parameters
  //b1.sleepSpeedLimit = 0.2; // Body will feel sleepy if speed<1 (speed == norm of velocity)
  //b1.sleepTimeLimit = 1; // Body falls asleep after 1s of sleepiness
  var mesh = createBox() //physi.shape2mesh(boxShape, game.materials.get('brick'))
  mesh.position = position.clone()
  game.scene.add(mesh);

  mesh.position = position.clone()
  game.scene.add(mesh);

  setTimeout(function() {
    console.log('initi tck')
    physi.add(mesh, b1)
    //game.on('tick', function(dt) {
      //debugger
      //physi.world.step(dt/1000);
      // Copy coordinates from Cannon.js to Three.js

    //})
  }, 4000)
  //var mesh = createBox()
  //mesh.rotation.z = Math.random() * Math.PI * 2
  //mesh.rotation.x = Math.random() * Math.PI * 2
  //mesh.rotation.y = Math.random() * Math.PI * 2
  //var position = game.camera.position.clone()
  ////plot.prev = position
  //mesh.position.z = position.z
  //mesh.position.y = position.y
  //mesh.position.x = position.x
  //physi.world.add()
  //// create a mesh and set the matertial
  //var mesh = new physi.BoxMesh(
    //new game.THREE.CubeGeometry(1, 1, 2), // width, height, depth
    //physi.createMaterial(
      //new game.THREE.MeshFaceMaterial(material),
      //.4, // medium friction
      //0.2 // medium restitution
    //), 10
  //);
  //mesh.rotation.z = Math.random() * Math.PI * 2
  //mesh.rotation.x = Math.random() * Math.PI * 2
  //mesh.rotation.y = Math.random() * Math.PI * 2
  ////document
  //var ray = game.raycast()
  //var position = game.camera.position.clone()
  ////plot.prev = position
  //mesh.position.z = position.z
  //mesh.position.y = position.y
  //mesh.position.x = position.x
  ////mesh.addEventListener('collision', function() {
    //////console.log('collision', arguments)
  ////})
  //setTimeout(function() {
    //var direction = game.cameraVector()
    //mesh.applyImpulse(new THREE.Vector3(direction[0], direction[1], direction[2]).multiplySelf({x: 200, y: 200, z: 200}), new THREE.Vector3( 0, 0, 0 ))
  //}, 100)
  //game.scene.add(mesh)
  //meshes.push(mesh)
}
window.meshes = []

setTimeout(function() {
  game.paused = false
}, 1000)

game.camera.position.set(1.942604445282342, 12.23094305038278, 3.9691374481227792)

game.appendTo(document.body)
window.game = game

window.fControls = new FirstPersonControls(game.camera, document.body)
game.on('tick', function(dt) {
  if (window.fr) return
  fControls.update(dt / 60)
})

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */
function FirstPersonControls( object, domElement ) {
  var THREE = game.THREE

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.movementSpeed = 0.7;
	this.lookSpeed = 0.01;

	this.lookVertical = true;
	this.autoForward = false;
   this.invertVertical = true;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', -1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;

			}

		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}

	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 81: /*Q*/ this.freeze = !this.freeze; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	this.update = function( delta ) {

		if ( this.freeze ) {

			return;

		}

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( !this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );

	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	//this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	//this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.handleResize();

};
