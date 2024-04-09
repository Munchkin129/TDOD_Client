// import react, tf and webcam
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";

// import context
import LabelContext from './context/LabelContext';

// import components
import LoadingIndicator from './components/LoadingIndicator';
import LabelList from "./components/LabelList";
import StatusIndicator from "./components/StatusIndicator";
import ProgressCircle from "./components/ProgressCircle";

// import styles
import "./styles/App.css";

// import draw
import {drawRect} from "./utilities/utilities"; 

// important constants
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const DETECTION_INTERVAL = 16.7;
const ACCURACY = 0.7;

// model host
const MODEL_URL = 'http://127.0.0.1:8080/model.json';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  // exchangable labels
  const [labels, setLabels] = useState({
    1: {name: 'ThumbsUp', color: 'green'},
    2: {name: 'ThumbsDown', color: 'blue'},
  });
  
  const numberOfLabels = Object.keys(labels).length;;

  // changes apperance of label colors
  const changeColor = (index, newColor) => {
    if (newColor && newColor.trim() !== "") {  
    setLabels(prevLabels => ({
        ...prevLabels,
        [index]: { ...prevLabels[index], color: newColor }
      }));
    }
  }; 

  // feedback managing loadtime and status
  const [isLoading, setIsLoading] = useState(false);
  const [displayMessage, setDisplayMessage] = useState({ hasMessage: false, message: "" , color: ""});

  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [modelLoaded, setModelLoaded] = useState(false);
  const updateModelStatus = (status) => {
    setModelLoaded(status);
  };
  
 const [boxesAssigned, setBoxesAssigned] = useState(false); 
  const updateBoxesStatus = (status) => {
    setBoxesAssigned(status);
  };

  // end visual loading process
  useEffect(() => {
    if (loadingProgress === 99) {
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 100);
      setDisplayMessage({ hasMessage: true, message: "Zuordnung erfolgreich." , color: "rgba(0, 255, 0, 0.75)"});
      updateBoxesStatus(true);
    }
  }, [loadingProgress]);

  // display messages
  useEffect(() => {
    if (displayMessage.hasMessage) {
      const timer = setTimeout(() => {
        setDisplayMessage({ hasMessage: false, message: "" , color: ""});
      }, 5000);    
      return () => clearTimeout(timer);
      }
  }, [displayMessage.hasMessage]);

  // intervalId to limit handle one detection process
  const [intervalId, setIntervalId] = useState(null);
  
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useEffect(() => {
    runCoco(labels);
    
    // cleanup interval when labels change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [labels]);

  // variables for detect function
  let boxesIndexisCompleted = false;
  let classesIndexisCompleted = false;
  let scoresIndexisCompleted = false;

  let boxesIndex = 0;
  let classesIndex = 0;
  let scoresIndex = 0;

  // Main function Eine Funktion, die ein TensorFlow-Modell lädt und eine Schleife startet, um Vorhersagen zu machen.
  const runCoco = async (currenntLabels) => {

    setIsLoading(true);

    try {
      // load network 
      const net = await tf.loadGraphModel(MODEL_URL);
      updateModelStatus(true);
      setIsLoading(false);

      setDisplayMessage({ hasMessage: true, message: "Model erfolgreich geladen." , color: "rgba(0, 255, 0, 0.75)"});

      // check if model loaded
      if (!net) {
        throw new Error('Failed to load the model.');
      }

      // clear any previous intervals
      if (intervalId) {
        clearInterval(intervalId);
      }
  
      // loop and detect
      const newIntervalID = setInterval(() => {
        detect(net, currenntLabels);
      }, DETECTION_INTERVAL);

      // setup the new interval and save the interval ID
      setIntervalId(newIntervalID);
    } catch (error) {
      setDisplayMessage({ hasMessage: true, message: "Fehler beim Laden des Models." , color: "rgba(255, 0, 0, 0.75)"});
    } finally {
      // loading feedback for user
      setIsLoading(false);

      const timer = setTimeout(() => {
        setIsLoading(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  };
  

  // Eine Funktion, die überprüft, ob Daten verfügbar sind, und dann das Modell verwendet, um Vorhersagen auf dem aktuellen Bild der Webcam zu machen. Sie zeichnet auch die Vorhersagen auf einem Canvas.
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

      // set video and canvas properties
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // make Detections
      const img = tf.browser.fromPixels(video);
      const resized = tf.image.resizeBilinear(img, [640,480]);
      const casted = resized.cast('int32');
      const expanded = casted.expandDims(0);
      const obj = await net.executeAsync(expanded);
      
      // sort boxes
      if(!classesIndexisCompleted && !scoresIndexisCompleted && !boxesIndexisCompleted){
        setIsLoading(false);

        for (let i = 0; i < 8; i++) {

          console.log(await obj[i].array());

          const dataArray = await obj[i].array();

          if (dataArray[0].length === 100) {
        
            const firstElement = dataArray[0];
            console.log(i, dataArray);

            if ((Number.isInteger(firstElement[0])) && (Number.isInteger((firstElement[50]))) && ((firstElement[0]) <= numberOfLabels) && ((firstElement[50]) <= numberOfLabels) && (!classesIndexisCompleted)) {
              console.log("classes: ", i);
              classesIndex = i;
              classesIndexisCompleted = true;
              setLoadingProgress(currentProgress => currentProgress + 33);
            } else if (((firstElement[0] >= 0) && (firstElement[0] <= 1)) && ((firstElement[50] >= 0) && (firstElement[50] <= 1)) && (!scoresIndexisCompleted)) {
              console.log("scores: ", i);
              scoresIndex = i;
              scoresIndexisCompleted = true;
              setLoadingProgress(currentProgress => currentProgress + 33);
            } else if (firstElement[0].length === 4 && !boxesIndexisCompleted) {
              console.log("boxes: ", i);
              boxesIndex = i;
              boxesIndexisCompleted = true;
              setLoadingProgress(currentProgress => currentProgress + 33);
            } else {
              console.log("übrig: ", i);
            }
          }
        }
      }
      
      // draw detecions
     if (classesIndexisCompleted && scoresIndexisCompleted && boxesIndexisCompleted) {

      const boxes = await obj[boxesIndex].array();
      const classes = await obj[classesIndex].array();
      const scores = await obj[scoresIndex].array();
    
      // draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // update drawing utility
        requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], ACCURACY, videoWidth, videoHeight, ctx, currenntLabels)}); 

      }  
      
      // disope
      tf.dispose(img);
      tf.dispose(resized);
      tf.dispose(casted);
      tf.dispose(expanded);
      tf.dispose(obj);

    }
  }

  return (
    <LabelContext.Provider value={{ labels }}>
    <div className="app"> 

      {isLoading && <LoadingIndicator />}
      {loadingProgress > 0 && !isLoading && <ProgressCircle progress={loadingProgress} />}

      {displayMessage.hasMessage && <div style={{ backgroundColor: displayMessage.color }}
        className="message">
        {displayMessage.message}</div>}

      <div className="header">
      <h1>Object Detection</h1>
      </div>

      <div className="liveFeed">
        <Webcam
          ref={webcamRef}
          muted={true} 
          className="webcamStyle"
          style={{  
            width: `${VIDEO_WIDTH}px`,
            height: `${VIDEO_HEIGHT}px`
          }}
        />
        <canvas
          ref={canvasRef}
          className="canvasStyle"
          style={{  
            width: `${VIDEO_WIDTH}px`,
            height: `${VIDEO_HEIGHT}px`
          }}
        />

      </div>
      <div className="statusIndicator">
        <StatusIndicator label="Model" status={modelLoaded} />
        <StatusIndicator label="Boxes Assigned" status={boxesAssigned} />
      </div>

      <div className="labelList">
        <LabelList changeColor={changeColor}/>
      </div>

      <div className="footer">
      <p>© 2024 Dirk Hofmann. <a href="https://git.ai.fh-erfurt.de/ma4163sp1/ba_project/ss23/ba_project_ss23_hofmann" target="_blank" rel="noopener noreferrer" className="FooterLink">GitLab.</a></p>
      </div>
    </div>
    </LabelContext.Provider>
  );
}

export default App;