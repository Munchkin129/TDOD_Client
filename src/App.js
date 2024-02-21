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

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [labels, setLabels] = useState({
    1: {name: 'ThumbsUp', color: 'green'},
    2: {name: 'ThumbsDown', color: 'blue'}
  });

  const changeColor = (index, newColor) => {
    setLabels(prevLabels => ({
      ...prevLabels,
      [index]: { ...prevLabels[index], color: newColor }
    }));
  };  

  const [modelLoaded, setModelLoaded] = useState(false);
  const [boxesAssigned, setBoxesAssigned] = useState(false);

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
  const runCoco = async () => {
    try {
      // 3. TODO - Load network 
      const net = await tf.loadGraphModel('http://127.0.0.1:8080/model.json');
      updateModelStatus(true);
      // Überprüfen, ob das Modell erfolgreich geladen wurde
      if (!net) {
        throw new Error('Failed to load the model.');
      }
  
      // Loop and detect hands Eine Funktion, die überprüft, ob Daten verfügbar sind, und dann das Modell verwendet, um Vorhersagen auf dem aktuellen Bild der Webcam zu machen. Sie zeichnet auch die Vorhersagen auf einem Canvas.
      setInterval(() => {
        detect(net);
      }, 16.7);
    } catch (error) {
      console.error('Error loading the model:', error);
      console.log(modelIsLoaded);
    }
  };
  


  const detect = async (net) => {
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
    
      
      /*
      if(!test1isCompleted && !test2isCompleted && !test3isCompleted)
      {
        for (let index = 0; index <= 6; index++) {
          const currentArrayData = await obj[index]?.array();
          
          if (currentArrayData) {
            const currentArray = currentArrayData[0]?.[0];
        
            if (currentArray) {
              if (currentArray.length === 4 && currentArray.every((value) => value >= 0 && value <= 1 && !test1isCompleted)) {
                // Bedingung für Boxes: 4 Einträge zwischen 0 und 1
                console.log("Boxes:", currentArray, index);
                test1isCompleted = true;
              } else if (currentArray.length === 1 && Number.isInteger(currentArray[0]) && !test2isCompleted) {
                // Bedingung für Classes: einen Eintrag und nur ganzzahlige Zahlen
                console.log("Classes:", classes, index);
                test2isCompleted = true;
              } else if (currentArray.length === 1 && currentArray[0] >= 0 && currentArray[0] <= 1 && !test3isCompleted) {
                // Bedingung für Scores: einen Eintrag zwischen 0 und 1
                console.log("Scores:", scores, index);
                test3isCompleted = true;
              } else {
                console.log(`Invalid currentArray structure for index ${index}:`, currentArray);
              }
            } else {
              console.log(`currentArray is undefined for index ${index}`);
            }
          } else {
            console.log(`Data for index ${index} is undefined`);
          }
        }
      }
      */

      /*
      for (let index = 0; index <= 6; index++) {
        const currentArrayData = await obj[index]?.array();
        
        if (currentArrayData) {
          const currentArray = currentArrayData[0]?.[0];
      
          if (currentArray) {
            if (currentArray.length === 4 && currentArray.every((value) => value >= 0 && value <= 1)) {
              // Bedingung für Boxes: 4 Einträge zwischen 0 und 1
              console.log("Boxes:", currentArray, index);
              // Hier kannst du weiter mit den Boxes arbeiten...
            } else if (currentArray.length === 1 && Number.isInteger(currentArray[0])) {
              // Bedingung für Classes: einen Eintrag und nur ganzzahlige Zahlen
              const classes = currentArray;
              console.log("Classes:", classes, index);
              // Hier kannst du weiter mit den Classes arbeiten...
            } else if (currentArray.length === 1 && currentArray[0] >= 0 && currentArray[0] <= 1) {
              // Bedingung für Scores: einen Eintrag zwischen 0 und 1
              const scores = currentArray;
              console.log("Scores:", scores, index);
              // Hier kannst du weiter mit den Scores arbeiten...
            } else {
              console.log(`Invalid currentArray structure for index ${index}:`, currentArray);
            }
          } else {
            console.log(`currentArray is undefined for index ${index}`);
          }
        } else {
          console.log(`Data for index ${index} is undefined`);
        }
      }
      */
      
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
        requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.4, videoWidth, videoHeight, ctx, labels)}); 
      }  

      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  };

  useEffect(()=>{runCoco()},[]);

  useEffect(() => {
    console.log(labels);
  }, [labels]);

  return (
    <LabelContext.Provider value={{ labels }}>
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
        <div className="StatusIndicatorHelper">
          <StatusIndicator label="Model" status={modelLoaded} />
          <StatusIndicator label="Boxes Assigned" status={boxesAssigned} />
        </div>
        <LabelList changeColor={changeColor}/>
      </header>
    </div>
    </LabelContext.Provider>
  );
}

export default App;