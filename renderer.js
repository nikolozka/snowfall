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


var scene, camera, renderer, controls, axis, gui, geometry, material, mesh, smoothMesh, light;

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

var screenShotPath = 'C:/Workspace/PARTICLE_STUFF/Earth/earth_geo_'

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

  light = new THREE.PointLight( 0xffffff, 2, 300, 1);
  light.position.set( 0, 50, 0 );
  scene.add( light );

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( mwidth, mheight_top);	
  renderer.updateStyle=false
  document.getElementById('cnvs').appendChild( renderer.domElement );


  camera.position.z = 0;
  camera.position.y = 30

  camera.lookAt(0,0,0)


  



};

function animate(now) {
	requestAnimationFrame( animate );
	camera.position.z=Math.sin(now*0.001)*150+200
	//camera.position.x=Math.sin(now*0.0009)*150

	camera.lookAt(0,0,0)

	light.position.z = Math.sin(now*0.001)*200
	light.position.x = Math.cos(now*0.001)*200


	//camera.position.y=Math.sin(now*0.001)*50

	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.01;

	//mesh.translateY(-0.07)

	renderer.render( scene, camera );
}

function initPlane(){
	console.log("we are live ")



	var textureLoader = new THREE.TextureLoader();
	var maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

	//var texture = textureLoader.load( "C:/Workspace/PARTICLE_STUFF/Earth/earth_geo_1574643690754.png" );
	var texture = textureLoader.load(screenShotPath + '.png')

	//console.log(texture.image)

	//texture.image.src = img.src

	texture.anisotropy = maxAnisotropy;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;	
	//texture.minFilter = THREE.LinearFilter;
	//texture.minFilter = texturePainting.magFilter = THREE.LinearFilter;
	//texture.mapping = THREE.UVMapping;

	//texture.flipY = true
	//texture.flipX= true


	var geometry = new THREE.PlaneBufferGeometry( 100, 100, segments, segments );
	//geometry.translate(0,-200,-avg/100)
	geometry.rotateX( -Math.PI / 2 );
	geometry.translate(0,0,0)

	var vertices = geometry.attributes.position.array;
	for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

		//vertices[ j + 1 ] = heightmap[ Math.round( (i/3) / 32 )%32 ][i%32] / 100-50; 
		vertices[ j + 1 ] = (heightmap[ Math.round( (i/3) / 32 )%32 ][i%32] - hmin)*(10)/(hmax-hmin)-50; 

		//vertices[ j + 1 ] = 0

		//console.log(Math.round( (i/3) / 32 )%32)
		//console.log(i%32)
		//console.log( heightmap[ Math.round( (i/3) / 32 )%32 ][i%32])
// 
	}

	material = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, map: texture, flatShading: false} )
    mesh = new THREE.Mesh( geometry, material );

    console.log(mesh)

	/*var tempGeo = new THREE.Geometry().fromBufferGeometry(mesh.geometry);

	tempGeo.mergeVertices();


	//var modifier = new SubdivisionModifier( 1 );
	//modifier.modify(tempGeo)

	tempGeo.computeVertexNormals();
	tempGeo.computeFaceNormals();

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


	scene.add( mesh );


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
			/*  new google.maps.Polyline({
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
  			console.log(heightmap)
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

  window.addEventListener('load', onLoad);

  

