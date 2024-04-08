// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import LabelContext from './LabelContext';
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";

import LoadingIndicator from './LoadingIndicator';
import LabelList from "./LabelList";
import StatusIndicator from "./StatusIndicator";
import ProgressCircle from "./ProgressCircle";

import "./App.css";

import { nextFrame } from "@tensorflow/tfjs";
// 2. TODO - Import drawing utility here
import {drawRect} from "./utilities"; 
import { expandShapeToKeepDim } from "@tensorflow/tfjs-core/dist/ops/axis_util";

const VIDEO_WIDTH = "640px";
const VIDEO_HEIGHT = "480px";
const DETECTION_INTERVAL = 16.7; // Zeit in ms zwischen den Vorhersagen

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [labels, setLabels] = useState({
    1: {name: 'ThumbsUp', color: 'green'},
    2: {name: 'ThumbsDown', color: 'blue'},
  });

  const changeColor = (index, newColor) => {
    if (newColor && newColor.trim() !== "") {  
    setLabels(prevLabels => ({
        ...prevLabels,
        [index]: { ...prevLabels[index], color: newColor }
      }));
    }
  };  

  const [isLoading, setIsLoading] = useState(false);
  const [displayMessage, setDisplayMessage] = useState({ hasMessage: false, message: "" , color: ""});

  const [loadingProgress, setLoadingProgress] = useState(0);


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

    setIsLoading(true);

    try {
      // 3. TODO - Load network 
      const net = await tf.loadGraphModel('http://127.0.0.1:8080/model.json');
      updateModelStatus(true);
      setIsLoading(false);

      setDisplayMessage({ hasMessage: true, message: "Model erfolgreich geladen." , color: "rgba(0, 255, 0, 0.75)"});

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
      setDisplayMessage({ hasMessage: true, message: "Fehler beim Laden des Models." , color: "rgba(255, 0, 0, 0.75)"});
    } finally {
      setIsLoading(false);

      if(modelLoaded){
      const timer = setTimeout(() => {
        setIsLoading(true);
      }, 1000);
      return () => clearTimeout(timer);
      }
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
          setIsLoading(false);
          setLoadingProgress(30);
        } else if (((dataArray[0] >= 0) && (dataArray[0] <= 1)) && ((dataArray[50] >= 0) && (dataArray[50] <= 1)) && (!scoresIndexisCompleted)) {
          console.log("scores: ", i);
          scoresIndex = i;
          scoresIndexisCompleted = true;
          setLoadingProgress(60);
        } else if (dataArray[0].length === 4 && !boxesIndexisCompleted) {
          console.log("boxes: ", i);
          boxesIndex = i;
          boxesIndexisCompleted = true;
          setLoadingProgress(100);
          setTimeout(() => setLoadingProgress(0), 500);
          setDisplayMessage({ hasMessage: true, message: "Zuordnung erfolgreich." , color: "rgba(0, 255, 0, 0.75)"});

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

  useEffect(() => {
    if (displayMessage.hasMessage) {
      const timer = setTimeout(() => {
        setDisplayMessage({ hasMessage: false, message: "" , color: ""});
      }, 5000);
  
      return () => clearTimeout(timer);
    }
  }, [displayMessage.hasMessage]);

  return (
    <LabelContext.Provider value={{ labels }}>
    <div className="App"> 

      {isLoading && <LoadingIndicator />}
      {loadingProgress > 0 && !isLoading && <ProgressCircle progress={loadingProgress} />}

      {displayMessage.hasMessage && <div style={{ backgroundColor: displayMessage.color }}
        className="message">
        {displayMessage.message}</div>}

      <div className="Header">
      <h1>Object Detection</h1>
      </div>

      <div className="LiveFeed">
        <Webcam
          ref={webcamRef}
          muted={true} 
          className="webcamStyle"
          style={{  
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
          }}
        />
        <canvas
          ref={canvasRef}
          className="canvasStyle"
          style={{  
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
          }}
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
      <p>© 2024 Dirk Hofmann. <a href="https://git.ai.fh-erfurt.de/ma4163sp1/ba_project/ss23/ba_project_ss23_hofmann" target="_blank" rel="noopener noreferrer" className="FooterLink">GitLab.</a></p>
      </div>
    </div>
    </LabelContext.Provider>
  );
}

export default App;