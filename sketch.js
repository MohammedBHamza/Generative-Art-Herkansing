// reference https://tympanus.net/codrops/2018/03/06/creative-audio-visualizers/
var spot = {
  x: 100,
  y: 50
};

var col = {
  r: 255,
  g: 0,
  b: 0
};

let capture;
let tracker
let positions;

let x
let y

let video;
let poseNet;
let poses = [];
let graphics;
let modelLoaded = false;


var songs = [ "kross.mp3", "freestyle.mp3", "lose.mp3"];
var colorPalette = ["#FAA275", "#19C4D1", "#ED688B", "#fff"];
var sliderRate;

var pieces, radius, fft, mapMouseX, mapMouseY, audio, toggleBtn, uploadBtn, uploadedAudio, uploadAnim;
var bgColor = "#000";
var bassColor = ["#004FC5", "#0066FF"];
var midColor = "#FF3232";
var trembleColor = "#84FFAE";
var uploadLoading = false;

function preload() {
	audio = loadSound(songs[Math.floor(random(songs.length))]);
}


function uploaded(file) {
	uploadLoading = true;
	uploadedAudio = loadSound(file.data, uploadedAudioPlay);
}


function uploadedAudioPlay(audioFile) {

	uploadLoading = false;

	if (audio.isPlaying()) {
		audio.pause();
	}

	audio = audioFile;
	audio.loop();
}


function setup() {
pixelDensity(1);
  createCanvas(640, 480);
  graphics = createGraphics(640, 480);
  graphics.clear();

  graphics.colorMode(HSB);

  video = createCapture(VIDEO);
  video.size(width, height);
  // load p5 functions:
  createCanvas(windowWidth, windowHeight);

  capture = createCapture(VIDEO);
  capture.elt.setAttribute('playsinline', ''); // this line makes your program works on iPhone 11

  capture.size(width, height);
  capture.hide();

  // load clmtrackr functions:
  tracker = new clm.tracker(); // create a new clmtrackr object
  tracker.init(); // initialize the object
  tracker.start(capture.elt); // start tracking the video element capture.elt
  
    let options = {
    maxPoseDetections: 5,
  }
  poseNet = ml5.poseNet(video, modelReady, options);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
    // console.log(poses);
  });
  // poses
  // nose, leftEye, rightEye, leftEar, rightEar
  // Hide the video element, and just show the canvas
  video.hide();
  
  
	uploadAnim = select('#uploading-animation');
	createCanvas(windowWidth, windowHeight);
	pieces = 30;
	radius = windowHeight / 4;

	toggleBtn = createButton("Play / Pause");

	uploadBtn = createFileInput(uploaded);

	uploadBtn.addClass("upload-btn");

	toggleBtn.addClass("toggle-btn");
	
	toggleBtn.mousePressed(toggleAudio);

	fft = new p5.FFT();
	audio.loop();

}

function modelReady() {
  select('#status').html('Model Loaded');
  modelLoaded = true;
}



function draw() {
   image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  // drawSkeleton();
  image(graphics, 0, 0);
  
  
  image(capture, 0, 0, width, height);
  positions = tracker.getCurrentPosition(); // updates the tracker with current positions


  

  beginShape();
  for (let i = 0; i < positions.length; i++) {
  }
  endShape();

  // draw dots + numbers
  noStroke();

  for (let i = 0; i < positions.length; i++) {
    ellipse(positions[i][0], positions[i][1], 4, 4);
    
  }
  
    if (positions.length > 0) {
      let mouthLeft = createVector(positions[44][0], positions[44][1]);
      let mouthRight = createVector(positions[50][0], positions[50][1]);
      let smile = mouthLeft.dist(mouthRight);
      print(smile);
      
      
      if (smile > 90.00000000000000) {
        
        
  
  console.log('positive');
        background(bgColor);
	strokeWeight(1);

	fft.analyze();

	var bass = fft.getEnergy("bass");
	var treble = fft.getEnergy(50, 110);
	var mid = fft.getEnergy("mid");

	var mapMid = map(mid, 0, 255, -radius, radius);
	var scaleMid = map(mid, 0, 255, 1, 1.5);

	var mapTreble = map(treble, 0, 255, -radius / 2, radius * 2);
	var scaleTreble = map(treble, 0, 255, 0.5, 2);

	var mapbass = map(bass, 0, 255, 0, 200);
	var scalebass = map(bass, 0, 255, 0, 0.8);

	mapMouseX = map(mouseX, 0, width, 100, 200);
	mapMouseScale = map(mouseX, 0, width, 0.35, 0.2);
	mapMouseY = map(mouseY, 0, height, windowHeight / 4, windowHeight);

	pieces = 100;
	radius = 200;

	translate(windowWidth / 2, windowHeight / 2);

	for (i = 0; i < pieces; i += 1) {

		rotate(TWO_PI / pieces);

		noFill();


		/*----------  BASS  ----------*/
		push();
		strokeWeight(8);
		stroke(bassColor[0]);
		scale(scalebass + mapMouseScale);
		rotate(-frameCount * 0.05);
		point(mapbass, radius / 2);
		stroke(bassColor[1]);
		strokeWeight(2.2);
		ellipse(mapMouseX, mouseY*3, radius/2, radius);
		pop();



		/*----------  MID  ----------*/
		push();
		stroke(midColor);
		strokeWeight(4);
		rotate( smile / 90);
		line( 0, radius/2, 0, smile * 3 );
		pop();


		/*----------  TREMBLE  ----------*/
		push();
		stroke(trembleColor);
		strokeWeight(1);
		scale(scaleTreble/2);
		rotate(frameCount * 0.01);
		point(-100, radius / 2);
		point(100, radius / 2);
        ellipse(mapMouseX, mouseY/4, radius*2, radius);
		pop();

	}

       
        
        
        
}
      else {
  console.log('negative');

        textSize(72);
text('SMILE!', 10, 10);
        
}
}


	
}

function drawKeypoints() {
  // Loop through all the poses detected
  // for (let i = 0; i < poses.length; i++) {
  // For each pose detected, loop through all the keypoints
  if (poses.length > 0) {
    let pose = poses[0].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let rightWrist = pose.keypoints.find(keypoint => keypoint.part === 'rightWrist');
      let leftWrist = pose.keypoints.find(keypoint => keypoint.part === 'leftWrist');

      let keypoint = pose.keypoints[j];
      let handHue = (rightWrist.position.x / width) * 360;

      // draw with the nose
      // use the right hand x position for hue 
      // use the right hand y position for size
      if (keypoint.score > 0.5 && keypoint.part == "nose") {
        graphics.fill(handHue, 100, 100);
        graphics.noStroke();
        graphics.ellipse(keypoint.position.x, keypoint.position.y, height - rightWrist.position.y);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function toggleAudio() {
	if (audio.isPlaying()) {
		audio.pause();
	} else {
		audio.play();
	}
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}