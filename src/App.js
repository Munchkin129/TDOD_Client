// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import LabelContext from './LabelContext';
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";

import LabelList from "./LabelList";
import "./App.css";

import { nextFrame } from "@tensorflow/tfjs";
// 2. TODO - Import drawing utility here
import {drawRect} from "./utilities"; 
import { expandShapeToKeepDim } from "@tensorflow/tfjs-core/dist/ops/axis_util";

function StatusIndicator({ label, status }) {
  const color = status ? "green" : "red";

  return (
    <div style={{ color }}>
      {label}: {status ? "Loaded" : "Not Loaded"}
    </div>
  );
}

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const DETECTION_INTERVAL = 16.7; // Zeit in ms zwischen den Vorhersagen

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [labels, setLabels] = useState({
    1: {name: 'ThumbsUp', color: 'green'},
    2: {name: 'ThumbsDown', color: 'blue'}
  });

  const changeColor = (index, newColor) => {
    if (newColor && newColor.trim() !== "") {  
    setLabels(prevLabels => ({
        ...prevLabels,
        [index]: { ...prevLabels[index], color: newColor }
      }));
    }
  };  

  const [modelLoaded, setModelLoaded] = useState(false);
  const [boxesAssigned, setBoxesAssigned] = useState(false);

  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const updateModelStatus = (status) => {
    setModelLoaded(status);
  };

  const updateBoxesStatus = (status) => {
    setBoxesAssigned(status);
  };

  let modelIsLoaded = false;

  const numberOfLabels = 2;

  let boxesIndexisCompleted = false;
  let classesIndexisCompleted = false;
  let scoresIndexisCompleted = false;

  let counter = 0;
  let index = 0;

  let boxesIndex = 0;
  let classesIndex = 0;
  let scoresIndex = 0;

  // Main function Eine Funktion, die ein TensorFlow-Modell lädt und eine Schleife startet, um Vorhersagen zu machen.
  const runCoco = async (currenntLabels) => {
    try {
      // 3. TODO - Load network 
      const net = await tf.loadGraphModel('http://127.0.0.1:8080/model.json');
      updateModelStatus(true);
      // Überprüfen, ob das Modell erfolgreich geladen wurde
      if (!net) {
        throw new Error('Failed to load the model.');
      }

      // Clear any previous intervals
      if (intervalId) {
        clearInterval(intervalId);
      }
  
      // Loop and detect hands Eine Funktion, die überprüft, ob Daten verfügbar sind, und dann das Modell verwendet, um Vorhersagen auf dem aktuellen Bild der Webcam zu machen. Sie zeichnet auch die Vorhersagen auf einem Canvas.
      const newIntervalID = setInterval(() => {
        detect(net, currenntLabels);
      }, DETECTION_INTERVAL);

      // Setup the new interval and save the interval ID
      setIntervalId(newIntervalID);
    } catch (error) {
      console.error('Error loading the model:', error);
      console.log(modelIsLoaded);
    }
  };
  


  const detect = async (net, currenntLabels) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)
      
      if(index <= counter){

        for (let i = 0; i < 8; i++) {
    
          console.log(await obj[i].array());

          if ((await obj[i].array())[0].length === 100) {
            
            const dataArray = (await obj[i].array())[0];
            console.log(i, dataArray);

        if ((Number.isInteger(dataArray[0])) && (Number.isInteger((dataArray[50]))) && ((dataArray[0]) <= numberOfLabels) && ((dataArray[50]) <= numberOfLabels) && (!classesIndexisCompleted)) {
          console.log("classes: ", i);
          classesIndex = i;
          classesIndexisCompleted = true;
        } else if (((dataArray[0] >= 0) && (dataArray[0] <= 1)) && ((dataArray[50] >= 0) && (dataArray[50] <= 1)) && (!scoresIndexisCompleted)) {
          console.log("scores: ", i);
          scoresIndex = i;
          scoresIndexisCompleted = true;
        } else if (dataArray[0].length === 4 && !boxesIndexisCompleted) {
          console.log("boxes: ", i);
          boxesIndex = i;
          boxesIndexisCompleted = true;
        } else {
          console.log("übrig: ", i);
        }
      }
      index++;
      }
    }
      
     if (boxesIndexisCompleted && classesIndexisCompleted && scoresIndexisCompleted) {
      updateBoxesStatus(true);
      // console.log(boxesIndex,classesIndex,scoresIndex);
      const boxes = await obj[boxesIndex].array()
      const classes = await obj[classesIndex].array()
      const scores = await obj[scoresIndex].array()
    
      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)
        requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.4, videoWidth, videoHeight, ctx, currenntLabels)}); 
      }  

      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  };

  useEffect(() => {
    runCoco(labels);
    
    // Cleanup interval when labels change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [labels]);

  useEffect(() => {
    console.log(labels);
  }, [labels]);

  return (
    <LabelContext.Provider value={{ labels }}>
    <div className="App">
      <div className="Header">
      </div>
      <div className="LiveFeed">
        <Webcam
          ref={webcamRef}
          muted={true} 
          className="webcamStyle"
        />
        <canvas
          ref={canvasRef}
          className="canvasStyle"
        />
      </div>
      <div className="StatusIndicator">
        <StatusIndicator label="Model" status={modelLoaded} />
        <StatusIndicator label="Boxes Assigned" status={boxesAssigned} />
      </div>
      <div className="LabelList">
        <LabelList changeColor={changeColor}/>
      </div>
      <div className="Footer">
      </div>
    </div>
    </LabelContext.Provider>
  );
}

export default App;