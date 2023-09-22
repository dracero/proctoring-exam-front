<script>
  // @ts-nocheck
  import * as tf from "@tensorflow/tfjs";
  import { onMount, afterUpdate } from 'svelte';
  import { count, image } from "./stores.js"
  import {scale, fly, fade} from 'svelte/transition';
  import Message from "./Message.svelte";
  import LoadingAnimation from "./LoadingAnimation.svelte";
  import { page } from '$app/stores';
  import Screen from './Screen.svelte';
  import Reel from './Reel.svelte';

  $: state = "instruction-reel";

  // VARIABLES
  let countValue;
  let imageValue;
  let dataCollectorButtons;
  let videoRef;
   /**
     * @type {HTMLCanvasElement}
     */
  let canvasRef;


  // Other variables
  let mobilenet = undefined;
  let STOP_DATA_GATHER = -1;
  let videoPlaying = false;
  let gatherDataState = STOP_DATA_GATHER;
  const MOBILE_NET_INPUT_WIDTH = 224;
  const MOBILE_NET_INPUT_HEIGHT = 224;
  let trainingDataInputs = [];
  let trainingDataOutputs = [];
  let examplesCount = [];
  let predict = false;
  let model;

  // DOM Elements
  let STATUS;
  let VIDEO;
  let ENABLE_CAM_BUTTON;
  let TRAIN_BUTTON;
  let CLASS_NAMES = [];

  let intervalId;

  $: if (state === "render-test") {
    enableWebCam();
    intervalId = setInterval(takePhotoPeriodically, 10000);
  } else if (intervalId) {
    clearInterval(intervalId);
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function success(){
    let previousState=state;
    state = "success";
    wait(2000);
    state = previousState;
  }

  function loadDOMElements(){
    STATUS = document.getElementById('status');
    VIDEO = document.getElementById('webcam');
    TRAIN_BUTTON = document.getElementById('train'); 
    ENABLE_CAM_BUTTON = document.getElementById('enableCam');
    if(ENABLE_CAM_BUTTON) 
      ENABLE_CAM_BUTTON.addEventListener('click', enableCam);  
    if(TRAIN_BUTTON) 
      TRAIN_BUTTON.addEventListener('click', trainAndPredict);
    dataCollectorButtons = document.querySelectorAll('button.dataCollector');
    CLASS_NAMES = [];
    CLASS_NAMES.push("En Cámara");
    CLASS_NAMES.push("Fuera de Cámara");
    for (let i = 0; i < dataCollectorButtons.length; i++) {
      dataCollectorButtons[i].addEventListener('click', gatherDataForClass);
    }
  }

  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async function enableWebCam(){
    if (hasGetUserMedia()) {
      // getUsermedia parameters.
      const constraints = {
        video: true,
        width: 640, 
        height: 480 
      };
      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        VIDEO.srcObject = stream; // MediaStream object is assigned to the <video> element
        // When the stream is ready, videoPlaying becomes true and the Enable Webcam button is removed from the DOM  
        VIDEO.addEventListener('loadeddata', function() {
          videoPlaying = true;
        });
      });
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }
  }

  async function enableCam() {
    state="loading";
    await wait(1000);
    if (hasGetUserMedia()) {
      // getUsermedia parameters.
      const constraints = {
        video: true,
        width: 640, 
        height: 480 
      };
  
      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        VIDEO.srcObject = stream; // MediaStream object is assigned to the <video> element
        // When the stream is ready, videoPlaying becomes true and the Enable Webcam button is removed from the DOM  
        VIDEO.addEventListener('loadeddata', function() {
          videoPlaying = true;
        });
      });
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }
    state="gather-class1-data";
  }

  async function trainAndPredict() {
    console.log("Ughhh I'm training and predictin...")
    // Predict flag set to false to stop the continuous prediction loop.
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

  function dataGatherLoop() {
    //state = "loading";
    if (videoPlaying && gatherDataState !== STOP_DATA_GATHER) { 
      //  This block of code captures the current video frame, resizes it to match the required 
      //  input dimensions of the MobileNet model, normalizes the pixel values, and then performs 
      //  a prediction using the MobileNet model. The result is a tensor representing the extracted 
      //  features of the image 
      let imageFeatures = tf.tidy(function() {
        let videoFrameAsTensor = tf.browser.fromPixels(VIDEO);
        let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, 
          MOBILE_NET_INPUT_WIDTH], true);
        let normalizedTensorFrame = resizedTensorFrame.div(255);
        return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
      });
      // Record the image features by pushing them onto the previously defined trainingDataInputs array 
      trainingDataInputs.push(imageFeatures);
      // We also record to which class this input belongs by pushing the current 
      // gatherDataState to the trainingDataOutputs array too 
      trainingDataOutputs.push(gatherDataState);
      
      // Initialize count (set to zero if undefined)
      if (examplesCount[gatherDataState] === undefined) {
        examplesCount[gatherDataState] = 0;
      }
      
      examplesCount[gatherDataState]++; // Set to 1
  
      // Update the STATUS element to notify which class is being captured 
      // by printing the current class name and data count
      STATUS.innerText = ''; 
      
      for (let n = 0; n < CLASS_NAMES.length; n++) {
        if (examplesCount[n] > 100){
          let newState;
          if (gatherDataState === 1)
            newState="render-test";
          if (gatherDataState === 0)
            newState="gather-class2-data";          
          dataCollectorButtons[0].click(); // Detiene la coleccion de datos
          dataCollectorButtons[0].remove(); // Quita el Botón  
          takePhoto(); //Esto hay que llevarlo al camponente Snap Svelte
          count.set(examplesCount[n])
          examplesCount[n] = 0;
          state = newState;
        }
      }
      //  Call this function recursively to collect a new frame on each iteration
      //  The recursion will stop once the button's 'mouseup' is detected
      //  This is represented by the click() action above
      window.requestAnimationFrame(dataGatherLoop);
    }
  }

  function dataGatherLoopv2(classNum) {
    //state = "loading";
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
      // Cuento las muestras de cada tipo
      examplesCount[classNum]++;
  

      if (examplesCount[classNum] > 100){
        dataCollectorButtons[classNum].click(); // Detiene la coleccion de datos
      }
      //  The window.requestAnimationFrame function is used to schedule the execution of a 
      //  function on the next available frame repaint in the browser.
      window.requestAnimationFrame(dataGatherLoop);
    }
  }

  function continueToRegistration() {
    state = "enable-webcam";
  }


  function gatherDataForClass() {   
    state="loading";
    // Set the gatherDataState variable to the current class number
    let classNumber = parseInt(this.getAttribute('data-1hot'));
    gatherDataState = (gatherDataState === STOP_DATA_GATHER) ? classNumber : STOP_DATA_GATHER;
    // Trigger data gathering loop
    dataGatherLoop();
  }

  function predictLoop() {
    console.log("prediction taking place uughh")
    //  Perform prediction as long as the 'predict' flag is set to true
    if (predict) {
      // Use TensorFlow.js to process the frame captured from the WebCam
      tf.tidy(function() {
        let videoFrameAsTensor = tf.browser.fromPixels(VIDEO).div(255);
        let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor,[MOBILE_NET_INPUT_HEIGHT, 
            MOBILE_NET_INPUT_WIDTH], true);
  
        let imageFeatures = mobilenet.predict(resizedTensorFrame.expandDims());
        let prediction = model.predict(imageFeatures).squeeze();
        let highestIndex = prediction.argMax().arraySync();
        let predictionArray = prediction.arraySync();
  
        STATUS.innerText = 'Predicción: ' + CLASS_NAMES[highestIndex] + ' con ' + Math.floor(predictionArray[highestIndex] * 100) + '% de confianza';
      });
      
      window.requestAnimationFrame(predictLoop);
    }
  }
  
  function logProgress(epoch, logs) {
    console.log('Data for epoch ' + epoch, logs);
  }
  // SUBSCRIBED STORES
  /*
  GPT: Stores in Svelte are designed to address the need for multiple components to share and react 
  to the same set of variables or state. In your case, the Detect.svelte component is subscribing 
  to the count and image stores.
  When the value of the count store changes, the countValue variable in the Detect.svelte component 
  will be updated to reflect the new value. Similarly, when the value of the image store changes, 
  the imageValue variable will be updated.
  By subscribing to these stores, the Detect.svelte component establishes a reactive connection with 
  the shared state. This means that whenever the value of the subscribed store changes, the component 
  will be notified and can react accordingly. It allows the component to stay in sync with the changes 
  happening in the shared state and update its internal variables (countValue and imageValue) as needed.
  This reactive behavior enables the Detect.svelte component to react to changes in the shared state and 
  perform actions or update its UI based on the updated values. Other components in your application can 
  also subscribe to these stores and react to their changes, allowing for a coordinated and synchronized 
  flow of data and updates across different parts of your application.
  In summary, stores provide a way for components to share and react to the same state, enabling them to 
  stay synchronized and update their behavior based on changes in the shared data.
  */
  count.subscribe(value => {
      countValue = value;
    });
  
  image.subscribe(value => {
      imageValue = value;
    });
  
  async function takePhoto() {
      // Get current frame from the video into the canvas
      canvasRef.getContext('2d').drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);
      // Get data URL representing the image as a base64-encoded string.
      const dataUrl = canvasRef.toDataURL('image/png');
      // Get the student's email from the page store
      const studentEmail = $page.data.session.user?.email;
      // Sets the value of the image store to the data URL. The value of the store is updated, and any component subscribing to the image store will be notified of the change and can react accordingly.
      image.set(dataUrl);
      // Stores to the DataBase
      const response = await fetch('/api/inPhoto', {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: studentEmail, // Add the email here
              imageData: imageValue
            })
         });
         if (response.ok) {
            console.log("Data inserted successfully");
         } else {
            console.error("Error inserting data:", response.statusText); 
      }
  }

  async function takePhotoPeriodically() {
      // Get current frame from the video into the canvas
      canvasRef.getContext('2d').drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);
      // Get data URL representing the image as a base64-encoded string.
      const dataUrl = canvasRef.toDataURL('image/png');
      // Get the student's email from the page store
      const studentEmail = $page.data.session.user?.email;
      // Sets the value of the image store to the data URL. The value of the store is updated, and any component subscribing to the image store will be notified of the change and can react accordingly.
      image.set(dataUrl);
      // Stores to the DataBase
      const response = await fetch('/api/inPeriodicPhotos', {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: studentEmail, // Add the email here
              imageData: imageValue
            })
         });
         if (response.ok) {
            console.log("Data inserted successfully");
         } else {
            console.error("Error inserting data:", response.statusText); 
      }
  }
  
  afterUpdate(() => {loadDOMElements();});

  onMount (() => {
  console.log("Loading DOM Elements")
  // Assign DOM elements to constants
  loadDOMElements()
  // Dimensions for the input image to the MobileNet model
  // Represents a state used for data gathering
  // Will be populated with the class names of our DOM elements
  // Assign Event Listeners to DOM elements
  
  // Several variables 
  
  // Helper function to check if the browser supports the getUserMedia API

  
  
  /**
   * Handle Data Gather for button mouseup/mousedown.
   **/
  
  
  /**
   * Loads the MobileNet model and warms it up so ready for use.
   **/
  async function loadMobileNetFeatureModel() {

    const URL = 
      'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
    
    mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
    
    // Warm up the model by passing zeros through it once.
    tf.tidy(function () {
      let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
      console.log(answer.shape);
    });
    console.log("Current State: " + state)
  }
  
  // Call the function immediately to start loading.
  console.log("Loading MobileNet Feature Model")
  loadMobileNetFeatureModel();
  
  model = tf.sequential();
  model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
  model.add(tf.layers.dense({units: CLASS_NAMES.length, activation: 'softmax'}));
  
  model.summary();
  
  // Compile the model with the defined optimizer and specify a loss function to use.
  console.log("Compiling model")
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
    <h2 id="status"></h2>
    <p></p>
  {#if state === "render-test"}
    <Screen />
    <video 
    id="webcam" 
    class="responsive-webcam-test"
    autoplay={true} 
    bind:this={videoRef} 
    ></video>
    <canvas 
      class="canvas" 
      style="position: fixed; top: -100px; left: -100px;"
      width="128" 
      height="96" 
      bind:this={canvasRef}>
    </canvas>
    {trainAndPredict()}
  {:else if state === "instruction-reel"}
    <Reel {state} {continueToRegistration}/>
  {:else}
      <div in:fade>
        <canvas in:fly={{y:1000,duration:1000}} class="webcam-placeholder"></canvas>
      </div>
      <video 
        id="webcam" 
        class="responsive-webcam"
        autoplay={true} 
        bind:this={videoRef} 
        ></video>
      <canvas 
        class="canvas" 
        style="position: fixed; top: -100px; left: -100px;"
        width="128" 
        height="96" 
        bind:this={canvasRef}>
      </canvas>
    {#if state === "loading"}
      <Message msg="Cargando..."/>
      <LoadingAnimation/>
    {/if}
    {#if state === "enable-webcam"}
      <Message msg="Habilite su web cam para continuar"/>
      <div class="button-container">
        <button id="enableCam" on:click in:scale={{delay:500}} out:scale>Habilitar Web Cam</button>
      </div>
    {/if}
    {#if state === "gather-class1-data"}
      <Message msg="Coloquese en frente de la cámara con su rostro claramente visible"/>
      <div class="button-container">
        <button 
          class="dataCollector" 
          data-1hot="0" 
          data-name="Class 1"
          on:click in:scale={{delay:500}} 
          out:scale
          >Obtener Registro Facial</button>
      </div>
    {/if}
    {#if state === "gather-class2-data"}
    <Message msg="Retire su rostro de la cámara y asegurese de que su entorno sea claramente visible"/>
    <div class="button-container">
      <button 
        class="dataCollector" 
        data-1hot="1" 
        data-name="Class 2"
        on:click in:scale={{delay:500}} 
        out:scale
        >Obtener Registro del Entorno</button>
    </div>
    {/if}
    {#if state === "train-and-predict"}
      <div class="button-container">
        <button id="train" on:click in:scale={{delay:500}} out:scale>Predecir</button>
      </div>
    {/if}
  {/if}
<style>
    
    .button-container {
      position: fixed;
      top: calc(87%); /* Adjust the top position as needed */
      left: calc(35%); /* Adjust the left position as needed */
    }
  
    button {
      width: 30vw;
      height: 8vh;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      color: white;
      background-color: rgb(0, 89, 255);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s, box-shadow 0.2s;
      font-family: "Helvetica";
    }
  
    button:hover {
      background-color: rgb(0, 89, 255);
      transform: scale(0.9);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }
  
    button:active {
      background-color: rgb(0, 130, 255);
      transform: scale(0.8);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    @keyframes rotate {
        0% {
        transform: rotate(0deg);
        }
        100% {
        transform: rotate(360deg);
        }
    }

    .responsive-webcam {
      position: fixed;
      top: calc(32%); /* Adjust the top position as needed */
      left: calc(30%); /* Adjust the left position as needed */
      width: 40vw;
      height: 50vh;
    }

    .responsive-webcam-test {
      position: fixed;
      top: -200px; /* Adjust the top position as needed */
      left: -200px; /* Adjust the left position as needed */
      width: 10vw;
      height: 10vh;
    }

    .webcam-placeholder {
      position: fixed;
      top: calc(32%); /* Adjust the top position as needed */
      left: calc(30%); /* Adjust the left position as needed */
      width: 40vw;
      height: 50vh;
      background-color: rgba(0, 0, 0, 1);
    }

</style>
