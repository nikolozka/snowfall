// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// west 39
// north 43
// east 46
// south 41


//const screenshot = require('electron-screenshot')



const electron = require('electron')
const remote = electron.remote
const desktopCapturer = electron.desktopCapturer;
const electronScreen = remote.screen;
const shell = electron.shell;
const THREE = require('three')
const dat = require('dat.gui')
const OrbitControls = require('three-orbitcontrols')

const SubdivisionModifier = require('three-subdivision-modifier')


var scene, camera, renderer, controls, axis, gui, geometry, material, mesh, smoothMesh, light, geometry;

var normals = [] 
var vertices = []  
var colors = [] 
var indices = []
var uvs = []

var size = 20;
var segments = 31;

let angle, px, py;
var img;
const sz = 25;

const mwidth = 1280
const mheight = 2000
const mheight_top = 720

const ratio = mwidth/mheight_top;

const fs = require('fs')
const os = require('os')
const path = require('path')

var screenShotPath = '../earth/geo_'

var faceIndices = [ 'a', 'b', 'c' ];


var gmap
var bounds
var elevator 
var heightmap = []

const lp = 1
var bnd = 16
var bnd2 = 32
var segmentset = 0;

var rtd = false;

const dbg = true;

var hmin = 0
var hmax = 0

function fillHeightMap(){
	for(var i=0; i<bnd2; i++){
		var row = []
		for(var j=0; j<bnd2; j++){
			row[j] = 0
		}
		heightmap[i] = row
		
	}
}


let onLoad = function() {

  //imgl = loadImage('C:/Workspace/PARTICLE_STUFF/Earth/earth_geo_1574727670439.png');
  fillHeightMap();
  initMap(0, 0, 10)

  google.maps.event.addListener(gmap, 'tilesloaded', function(){
  	captureMap();
    // do something only the first time the map is loaded
});

  google.maps.event.addListenerOnce(gmap, 'bounds_changed', function(){
  	elevate()
  });
  updateRandom()

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 65, mwidth / mheight_top, 0.1, 1000 );
  scene.fog = new THREE.Fog(0x000000,150,400)
  //var ambient = new THREE.AmbientLight( 0xffffff, 0.4 );
  //scene.add( ambient );

//  light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
//  scene.add( light );

//  var helper = new THREE.HemisphereLightHelper( light, 5 );
//  scene.add( helper );

  //light = new THREE.PointLight( 0xffffff, 4, 300, 1);
  //light.position.set( 0, 50, 0 );
  //scene.add( light );
  light = new THREE.SpotLight( 0xffffff );
  light.position.set( 0, 100, 0 );
  light.angle = Math.PI/2
  light.penumbra = 0.1
  light.decay = 1
  light.distance = 500
  light.castShadow = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  light.shadow.camera.near = 500;
  light.shadow.camera.far = 4000;
  light.shadow.camera.fov = 30;


  //var tmpg = new THREE.SphereGeometry( 5, 32, 32 );
  //var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  //var sphere = new THREE.Mesh( geometry, material );
  //scene.add( sphere );

  scene.add( light );
  scene.add( light.target );
  //light.target  = tmpg




  console.log(light.target)

  //light.target = mesh


  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( mwidth, mheight_top);	
  renderer.updateStyle=false
  document.getElementById('cnvs').appendChild( renderer.domElement );


  camera.position.z = 150;
  camera.position.y = 150

  camera.lookAt(0,0,0)


  



};

function animate(now) {
	setTimeout( function(){ requestAnimationFrame( animate );}, 1000/30);

//	camera.position.z=Math.sin(now*0.001)*150+200
	//camera.position.x=Math.sin(now*0.0009)*150

//	camera.lookAt(0,0,0)
	light.position.set( Math.sin(now*0.001)*100, Math.abs(Math.cos(now*0.001))*60, -20);
	
	light.target.position.set(0,0,0)


	//camera.position.y=Math.sin(now*0.001)*50

	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.01;

	//mesh.translateY(-0.07)

	renderer.render( scene, camera );
	//texture.rotation +=0.01

}

function initPlane(){
	console.log("we are live ")



	var textureLoader = new THREE.TextureLoader();
	var maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

	//var texture = textureLoader.load( "C:/Workspace/PARTICLE_STUFF/Earth/earth_geo_1574643690754.png" );
	texture = textureLoader.load(screenShotPath + '.png')
	//texture = textureLoader.load("../earth/nmbrs.png")

	texture.anisotropy = 0;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;	

	texture.flipY = false
	//texture.rotation = Math.PI

	bufferGeometry = new THREE.PlaneBufferGeometry( 100, 100, segments, segments );
	bufferGeometry.rotateX( -Math.PI / 2 );
	bufferGeometry.translate(0,0,0)

	var vertices = bufferGeometry.attributes.position.array;
	for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

		//vertices[ j + 1 ] = (heightmap[ Math.round( (i/3) / 32 )%32 ][i%32] - hmin)*(10)/(hmax-hmin)-50; 
		vertices[ j + 1 ] = (heightmap[ Math.round( (i/3) / 32 )%32 ][i%32]/150 -(hmin+hmax)/300 -50); 
	
	}

	geometry = new THREE.Geometry().fromBufferGeometry( bufferGeometry );
	//geometry.mergeVertices();
//	var material = new THREE.MeshBasicMaterial( { color: 0xcccccc, wireframe: true } );
//	var mesh = new THREE.Mesh( bufferGeometry, material );
//	scene.add( mesh );

	
    //mesh.geometry.computeVertexNormals();

    //console.log(mesh)


	//console.log(geometry)
	material = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, map: texture, flatShading: false} )
	//console.log(geometry)

	subdivide( geometry, 2 );

	geometry.computeVertexNormals();
	geometry.computeFaceNormals();

    //mesh = new THREE.Mesh( geometry, material );

	/*var tempGeo = new THREE.Geometry().fromBufferGeometry(mesh.geometry);

	tempGeo.mergeVertices();


	//var modifier = new SubdivisionModifier( 1 );
	//modifier.modify(tempGeo)

	

	mesh.geometry = new THREE.BufferGeometry().fromGeometry(tempGeo);

	*/
	//console.log(vertices)

	//geometry.mergeVertices();
	//geometry.computeVertexNormals()




    //var modifier = new SubdivisionModifier( 2 );
    //console.log(modifier)
	//smoothGeometry = modifier.modify( geometry );

	//mesh.drawMode = THREE.TrianglesDrawMode;

	//mesh.translate(0, 0, 0)
	//mesh.geometry.computeVertexNormals(true);




	/*geometry = new THREE.BufferGeometry();

	for ( var i = 0; i <= segments; i ++ ) {
		var y = ( i * segmentSize ) - halfSize;
		for ( var j = 0; j <= segments; j ++ ) {
			var x = ( j * segmentSize ) - halfSize;
			vertices.push( x, - y, heightmap[i%32][j%32]/1000 );
			uvs.push(x,-y,)
						//normals.push( 0, 0, 1 );
						//colors.push( 1, 1, 1 );
		}
	}
				// generate indices (data for element array buffer)
	for ( var i = 0; i < segments; i ++ ) {
		for ( var j = 0; j < segments; j ++ ) {
			var a = i * ( segments + 1 ) + ( j + 1 );
			var b = i * ( segments + 1 ) + j;
			var c = ( i + 1 ) * ( segments + 1 ) + j;
			var d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );
			// generate two faces (triangles) per iteration
			indices.push( a, b, d ); // face one
			indices.push( b, c, d ); // face two
		}
	}
				//
	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
				//geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
				//geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	var material = new THREE.MeshBasicMaterial( { map: texture1 } );


	geometry.faces.forEach(function(face) {

		var components = ['x', 'y', 'z'].sort(function(a, b) {
			return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
		});

		var v1 = geometry.vertices[face.a];
		var v2 = geometry.vertices[face.b];
		var v3 = geometry.vertices[face.c];
	
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(v1[components[0]], v1[components[1]]),
			new THREE.Vector2(v2[components[0]], v2[components[1]]),
			new THREE.Vector2(v3[components[0]], v3[components[1]])
		]);

	});

	geometry.uvsNeedUpdate = true;*/


	/*material = new THREE.MeshPhongMaterial( {
					side: THREE.DoubleSide,
					map: texture1
				});*/

	//mesh = new THREE.Mesh( geometry, material );
	//scene.add( mesh );
}




function elevate(){
	bounds = gmap.getBounds();
	gmap.fitBounds(bounds)

	z=gmap.getZoom()
	gmap.setZoom(z+1)

	so = bounds.pa.g
	no = bounds.pa.h
	ea = bounds.ka.h
	we = bounds.ka.g

	//console.log(so,no,we,ea)

	var segment = 0
	segmentset = 0

	for(var ofst_y=0; ofst_y<4; ofst_y++){
			//console.log(ofst_x, ofst_y)
			var path = []
			for(var i=0; i<bnd2/2; i++){
				if(i%4 == 0){
					path[i]={lat: no-i*((no-so)/2)/bnd2-(no-so)*ofst_y/4.0, lng: we}
					i++
					path[i]={lat: no-(i-1)*((no-so)/2)/bnd2-(no-so)*ofst_y/4.0, lng: ea}
				}
				else{
					path[i]={lat: no-i*((no-so)/2)/bnd2-(no-so)*ofst_y/4.0, lng: ea}
					i++
					path[i]={lat: no-(i-1)*((no-so)/2)/bnd2-(no-so)*ofst_y/4.0, lng: we}
				}
			}
			  /*new google.maps.Polyline({
    			path: path,
    			strokeColor: '#0000CC',
    			strokeOpacity: 0.4,
    			map: gmap
    		});*/

			//console.log(heightmap)
			elevator = new google.maps.ElevationService;
			getElevation(path,segment)
			segment++
		}
	}

	function updateRandom(){
  	var lt = 41.0+Math.random()*(44.0-41.0) //define georgia bounds
  	var lg = 40.0+Math.random()*(47.0-40.0)
  	var zoom = 10.0+Math.random()*(18.0-10.0)
  	lt = Number(toFixed(lt,4))
  	lg = Number(toFixed(lg,4))
  	zoom = Number(toFixed(zoom,4))
  	gmap.setCenter({lat: lt, lng: lg});
  	gmap.setZoom(zoom)
  }

  function getElevation(path, segment){

  	elevator.getElevationAlongPath({
  		'path': path,
  		'samples': 256
  	}, function(elevations, status) {
  		if (status !== 'OK') {
  			return;
  		}
  		avg = 0

	  		hmax = elevations[0].elevation
	  		hmin = elevations[0].elevation

  		for (var idx = 0; idx < elevations.length; idx++) {

  			heightmap[Math.floor(idx/bnd2)+segment*bnd/2][idx%bnd2] = elevations[idx].elevation
  			if(elevations[idx].elevation > hmax) hmax = elevations[idx].elevation
  			if(elevations[idx].elevation < hmin) hmin = elevations[idx].elevation

  		}

  		avg = avg/elevations.length

  		segmentset++
  		if(segmentset == 4){
  			//console.log(heightmap)
  			for (var i = 1; i<32; i+=2)	{
  				heightmap[i].reverse()
				//console.log(heightmap[i])
			}

			fs.writeFile(screenShotPath+'.json', JSON.stringify(heightmap, null, 4), (err) => {
				if (err) {
					console.error(err);
					return;
				};
				console.log("File has been created");
			});}
		});
  }

  function initMap(latitude,longitude,zoom) {

  	remote.getCurrentWindow().setSize(mwidth,mheight)

  	gmap = new google.maps.Map(document.getElementById('gmap'), {
  		center: {lat: latitude, lng: longitude},
  		zoom: zoom,
  		disableDefaultUI: true,
  		mapTypeId: google.maps.MapTypeId.SATELLITE
  	});

  	elevator = new google.maps.ElevationService;

	/*const canvas = document.querySelector('canvas') //prepare to webgl
  	const gl = canvas.getContext('webgl2', {
  		antialias: false,
  		depth: false
  	});*/

  }

  function captureMap(){

  	const screenSize = remote.getCurrentWindow().getSize();


  	let options = {
  		thumbnailSize: {
  			width: 2048, //3840 
  			height: 2048 //2150
  		},
  		types: ["screen", "window"]
  	}

  	desktopCapturer.getSources(options).then(async sources => {
  		for (const source of sources) {
  			if (source.name === 'Snowfall!') {

  				img = source.thumbnail
  				let rect ={
  					x: 0,
  					y: mheight-mwidth,
  					width: mwidth,
  					height: mwidth
  				};

  				img = img.crop(rect)

  				rtd=true;
  				
  				screenShotPath = screenShotPath+Date.now()
  				fs.writeFile(screenShotPath+'.png', img.toPNG(), function (error) {
  					if (error) return console.log(error);
  					console.log(`Saved screenshot to: ${screenShotPath}`);
					start_draw()
  				});
  			}
  		}
  	})
  }

  function start_draw(){

  	initPlane()
  	animate();

  }
  

  function toFixed(num, fixed) {
  	var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  	return num.toString().match(re)[0];
  }


function subdivide( geometry, subdivisions ) {
	var modifier = new SubdivisionModifier( subdivisions, true );
	modifier.modify( geometry );



	geometry.computeBoundingBox();

	var max = geometry.boundingBox.max,
	    min = geometry.boundingBox.min;

	var offset = new THREE.Vector2(0 - min.x, 0 - min.z);
	var range = new THREE.Vector2(max.x - min.x, max.z - min.z);
	var faces = geometry.faces;
	//console.log(faces)
	//console.log(geometry)


	geometry.faceVertexUvs[0] = [];

	
	for (var i = 0; i < faces.length ; i++) {

	    var v1 = geometry.vertices[faces[i].a], 
	        v2 = geometry.vertices[faces[i].b], 
	        v3 = geometry.vertices[faces[i].c];

	    geometry.faceVertexUvs[0].push([
	        new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.z + offset.y)/range.y),
	        new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.z + offset.y)/range.y),
	        new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.z + offset.y)/range.y)
	    ]);
	}
	geometry.uvsNeedUpdate = true;


	mesh = new THREE.Mesh( geometry, material );
	console.log(mesh)

	scene.add( mesh );

	//wireframe.geometry = smoothMesh.geometry;
				//
//	updateUI( geometry, smoothGeometry );
}

  window.addEventListener('load', onLoad);

  

