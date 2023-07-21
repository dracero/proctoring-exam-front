<script>
// @ts-nocheck
import * as tf from "@tensorflow/tfjs";
import { onMount } from 'svelte';
import { count, image } from "./stores.js"

let countValue;
let imageValue;
let dataCollectorButtons;
let videoRef;
 /**
	 * @type {HTMLCanvasElement}
	 */
let canvasRef;
count.subscribe(value => {
		countValue = value;
	});

image.subscribe(value => {
    imageValue = value;
  });

async function takePhoto() {
    canvasRef.getContext('2d').drawImage(videoRef, 0, 0, videoRef.width, videoRef.height);
    const dataUrl = canvasRef.toDataURL('image/png');
    image.set(dataUrl);
    //En este lugar se manda a la base de datos
    const response = await fetch('/api/inPhoto', {
        method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ imageData: imageValue })
       });
       if (response.ok) {
           console.log("Data inserted successfully");
       } else {
               console.error("Error inserting data:", response.statusText); 
    }
}

onMount (() => {
const STATUS = document.getElementById('status');
const VIDEO = document.getElementById('webcam');
const ENABLE_CAM_BUTTON = document.getElementById('enableCam');
const TRAIN_BUTTON = document.getElementById('train');
const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const STOP_DATA_GATHER = -1;
const CLASS_NAMES = [];
ENABLE_CAM_BUTTON.addEventListener('click', enableCam);
TRAIN_BUTTON.addEventListener('click', trainAndPredict);


let mobilenet = undefined;
let gatherDataState = STOP_DATA_GATHER;
let videoPlaying = false;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];
let predict = false;

const status = document.getElementById('status');
if (status) {
  status.innerText = 'Loaded TensorFlow.js - version: ' + tf.version.tfjs;
}

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function enableCam() {
  if (hasGetUserMedia()) {
    // getUsermedia parameters.
    const constraints = {
      video: true,
      width: 640, 
      height: 480 
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      VIDEO.srcObject = stream;
      VIDEO.addEventListener('loadeddata', function() {
        videoPlaying = true;
        ENABLE_CAM_BUTTON.parentNode.removeChild(ENABLE_CAM_BUTTON);
      });
    });
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
}

function predictLoop() {
  if (predict) {
    tf.tidy(function() {
      let videoFrameAsTensor = tf.browser.fromPixels(VIDEO).div(255);
      let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor,[MOBILE_NET_INPUT_HEIGHT, 
          MOBILE_NET_INPUT_WIDTH], true);

      let imageFeatures = mobilenet.predict(resizedTensorFrame.expandDims());
      let prediction = model.predict(imageFeatures).squeeze();
      let highestIndex = prediction.argMax().arraySync();
      let predictionArray = prediction.arraySync();

      STATUS.innerText = 'Prediction: ' + CLASS_NAMES[highestIndex] + ' with ' + Math.floor(predictionArray[highestIndex] * 100) + '% confidence';
    });

    window.requestAnimationFrame(predictLoop);
  }
}

async function trainAndPredict() {
  predict = false;
  tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
  let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
  let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
  let inputsAsTensor = tf.stack(trainingDataInputs);
  let results = await model.fit(inputsAsTensor, oneHotOutputs, {shuffle: true, batchSize: 5, epochs: 10, 
      callbacks: {onEpochEnd: logProgress} });
  
  outputsAsTensor.dispose();
  oneHotOutputs.dispose();
  inputsAsTensor.dispose();
  predict = true;
  predictLoop();
}
function logProgress(epoch, logs) {
  console.log('Data for epoch ' + epoch, logs);
}

dataCollectorButtons = document.querySelectorAll('button.dataCollector');
for (let i = 0; i < dataCollectorButtons.length; i++) {
  dataCollectorButtons[i].addEventListener('click', gatherDataForClass);
  dataCollectorButtons[i].addEventListener('click', gatherDataForClass);
  // Populate the human readable names for classes.
  CLASS_NAMES.push(dataCollectorButtons[i].getAttribute('data-name'));
}


/**
 * Handle Data Gather for button mouseup/mousedown.
 **/
function gatherDataForClass() {
  let classNumber = parseInt(this.getAttribute('data-1hot'));
  gatherDataState = (gatherDataState === STOP_DATA_GATHER) ? classNumber : STOP_DATA_GATHER;
  dataGatherLoop();
}

function dataGatherLoop() {
  if (videoPlaying && gatherDataState !== STOP_DATA_GATHER) {  
      let imageFeatures = tf.tidy(function() {
      let videoFrameAsTensor = tf.browser.fromPixels(VIDEO);
      let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, 
          MOBILE_NET_INPUT_WIDTH], true);
      let normalizedTensorFrame = resizedTensorFrame.div(255);
      return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
    });

    trainingDataInputs.push(imageFeatures);
    trainingDataOutputs.push(gatherDataState);
    
    // Intialize array index element if currently undefined.
    if (examplesCount[gatherDataState] === undefined) {
      examplesCount[gatherDataState] = 0;
    }
    examplesCount[gatherDataState]++;

    STATUS.innerText = '';
    for (let n = 0; n < CLASS_NAMES.length; n++) {
      STATUS.innerText += CLASS_NAMES[n] + ' data count: ' + examplesCount[n] + '. ';
      if (examplesCount[n] > 100){
        dataCollectorButtons[n].click();
        dataCollectorButtons[n].remove();
        takePhoto(); //Esto hay que llevarlo al camponente Snap Svelte
        count.set(examplesCount[n])
        examplesCount[n] = 0;

      }
    }
    window.requestAnimationFrame(dataGatherLoop);
  }
}

/**
 * Loads the MobileNet model and warms it up so ready for use.
 **/
async function loadMobileNetFeatureModel() {
  const URL = 
    'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
  
  mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
  STATUS.innerText = 'MobileNet v3 loaded successfully!';
  
  // Warm up the model by passing zeros through it once.
  tf.tidy(function () {
    let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
    console.log(answer.shape);
  });
}

// Call the function immediately to start loading.
loadMobileNetFeatureModel();

let model = tf.sequential();
model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
model.add(tf.layers.dense({units: CLASS_NAMES.length, activation: 'softmax'}));

model.summary();

// Compile the model with the defined optimizer and specify a loss function to use.
model.compile({
  // Adam changes the learning rate over time which is useful.
  optimizer: 'adam',
  // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
  // Else categoricalCrossentropy is used if more than 2 classes.
  loss: (CLASS_NAMES.length === 2) ? 'binaryCrossentropy': 'categoricalCrossentropy', 
  // As this is a classification problem you can record accuracy in the logs too!
  metrics: ['accuracy']  
});
})
</script>
<h1>TensorFlow.js Example</h1>
  <p id="status"></p>
  <!-- svelte-ignore a11y-media-has-caption -->
  <video id="webcam" width="128" height="96" autoplay={true} bind:this={videoRef}></video>
  <p></p>
  <canvas class="canvas" width="128" height="96" bind:this={canvasRef}></canvas>
  <button id="enableCam" >Enable Webcam</button>
  <button id="train">Train and Predict</button>
  <button class="dataCollector" data-1hot="0" data-name="Class 1">Gather Class 1 Data</button>
  <button class="dataCollector" data-1hot="1" data-name="Class 2">Gather Class 2 Data</button>
  