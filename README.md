# Praxisprojekt Object Detection mit Webseitenanbindung

## Starten der Webseite und des Models
<details open>
<summary>Schritte zum Starten des Projekts</summary>

### In der Testumgebung
 
**Dependencies installieren**

In der Konsole:

<pre>
npm install
</pre>

**Webseite starten**

In der Konsole:

<pre>
npm start
</pre>

**Model lokal hosten**

In den Ordner des zu hostenden Models gehen, Konsole öffnen und http Server starten:

<pre>
http-server -c1 --cors .
</pre>

### Im Dockercontainer

In root-Verzeichnis des Projekts:
<pre>
docker-compose up --build
</pre>
    
</details>

## Durchführung der einzelnen Schritte
<details>
<summary>Tranieren des Tensorflow Model</summary>

## TensorFlow Model Trainingsdokumentation

Diese Dokumentation beschreibt den Prozess des Trainierens eines TensorFlow-Models, von der Einrichtung der Entwicklungsumgebung über das Sammeln von Bildern bis hin zum Export des Models für die Verwendung in unterschiedlichen Umgebungen.

### 1. Einrichtung der Entwicklungsumgebung

Zu Beginn wird eine virtuelle Umgebung erstellt.

<pre>
python -m venv od
</pre>

Starten der virtuellen Umgebung.

<pre>
.\od\Scripts\activate
</pre>

Installieren der notwendigen Abhängigkeiten.

<pre>
python -m pip install --upgrade pip
pip install ipykernel
python -m ipykernel install --user --name=od
</pre>

Das komplette Training findet in jupyter Notebook statt. Zum starten folgendes in der virtuellen Umgebung eingeben.

<pre>
jupyter notebook
</pre>

### 2. Sammeln und Labeln der Bilder

*Wir befinden uns im Dokument [Image Collection](https://www.hosteurope.de/blog/wie-sie-mit-einer-kreativen-404-fehlerseite-und-lustigen-inhalten-punkten/).*

Hier werden die Labels festgelegt. Es werden Bilder von zwei Handgesten ("Daumen hoch" und "Daumen runter") gesammelt. Die Bilder werden mit der integrierten Webcam des Laptops aufgenommen.
*number_imgs* gibt an, wie viele Bilder aufgenommen werden sollen.

<pre>
labels = ['thumbsup', 'thumbsdown']
number_imgs = 5
</pre>

### 3. Ordnerstruktur vorbereiten

Ein spezifischer Ordnerpfad für die gesammelten Bilder wird erstellt. Bei Bedarf werden die entsprechenden Verzeichnisse angelegt.

<pre>
IMAGES_PATH = os.path.join('Tensorflow', 'workspace', 'images', 'collectedimages')
if not os.path.exists(IMAGES_PATH):
    if os.name == 'posix':
        !mkdir -p {IMAGES_PATH}
    elif os.name == 'nt':
        !mkdir {IMAGES_PATH}

for label in labels:
    path = os.path.join(IMAGES_PATH, label)
    if not os.path.exists(path):
        !mkdir {path}
</pre>

### 4. Bilderfassung

Die Webcam wird verwendet, um die Bilder für jede Geste aufzunehmen. Dabei wird für jedes Label die angegebene Anzahl an Bilder aufgezeichnet und mittels einer einzigartig generierten UUID als Name abgespeichert.

<pre>
for label in labels:
    cap = cv2.VideoCapture(0)
    print('Collecting images for {}'.format(label))
    time.sleep(5)
    for imgnum in range(number_imgs):
        print('Collecting image {}'.format(imgnum))
        ret, frame = cap.read()
        imgname = os.path.join(IMAGES_PATH,label,label+'.'+'{}.jpg'.format(str(uuid.uuid1())))
        cv2.imwrite(imgname, frame)
        cv2.imshow('frame', frame)
        time.sleep(2)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
cap.release()
cv2.destroyAllWindows()
</pre>

### 5. Bilder annotieren

Das Tool [LabelImg](https://pypi.org/project/labelImg/) wird installiert und verwendet, um die Bilder zu beschriften und die entsprechenden Label-Daten vorzubereiten.
LabelImg ist ein grafisches Tool zur manuellen Beschriftung von Objekten in Bildern, das die Erstellung von Trainingsdaten für Bilderkennungsmodele erleichtert.

<pre>
!pip install --upgrade pyqt5 lxml
</pre>

### 6. Vorbereitung des Trainings

#### Aufteilung der Bilder

Vor der Durchführung des Tranings werden die gelabelten Bilder in die zwei Kategorien **Training** und **Test** eingeteilt.
\Tensorflow\workspace\images\train
\Tensorflow\workspace\images\test

Das Model wird auf den Trainingsdateien generiert und anhand der Testbilder evaluiert. Dies greift eine Überanpassung vorweg und gibt Aufschluss auf eine tatsächliche Effektivität des Models in der Praxis.

#### Pfade generieren

*Wir befinden uns im Dokument [Training and Detection](https://www.hosteurope.de/blog/wie-sie-mit-einer-kreativen-404-fehlerseite-und-lustigen-inhalten-punkten/).*

Als nächstes werden notwendigen Pfade und Dateinamen für das Modeltraining werden festgelegt. Dazu gehören Arbeitsverzeichnisse, Skripte, API-Modele, Annotationen und Bilder sowie Pfade für die vorab trainierten Modele.

<pre>
CUSTOM_MODEL_NAME = 'my_ssd_mobnet' 
PRETRAINED_MODEL_NAME = 'ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8'
PRETRAINED_MODEL_URL = 'http://download.tensorflow.org/models/object_detection/tf2/20200711/ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8.tar.gz'
</pre>

Bei *PRETRAINED_MODEL_NAME* handelt es sich um ein vortrainiertes und bewährtes TensorFlow Zoo Model. Durch den Einsatz dieses wird der Entwicklungsprozess erheblich beschleunigt.

Ich habe mich für *SSD MobileNet v2 320x320* entschieden, weil es schnell trainiert. [Hier](https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/tf2_detection_zoo.md) andere Möglichkeiten.

#### Installieren von Tensorflow Object Detection 

<pre>
if os.name=='nt':
    url="https://github.com/protocolbuffers/protobuf/releases/download/v3.15.6/protoc-3.15.6-win64.zip"
    wget.download(url)
    !move protoc-3.15.6-win64.zip {paths['PROTOC_PATH']}
    !cd {paths['PROTOC_PATH']} && tar -xf protoc-3.15.6-win64.zip
    os.environ['PATH'] += os.pathsep + os.path.abspath(os.path.join(paths['PROTOC_PATH'], 'bin'))   
    !cd Tensorflow/models/research && protoc object_detection/protos/*.proto --python_out=. && copy object_detection\\packages\\tf2\\setup.py setup.py && python setup.py build && python setup.py install
    !cd Tensorflow/models/research/slim && pip install -e .
</pre>

Durch das Verfikationskript wird kontrolliert, ob die Installation funktioniert hat.

<pre>
VERIFICATION_SCRIPT = os.path.join(paths['APIMODEL_PATH'], 'research', 'object_detection', 'builders', 'model_builder_tf2_test.py')
# Verify Installation
!python {VERIFICATION_SCRIPT}
</pre>

#### Erstellen der Label Map

Diese dient der klaren Zuordnung zwischen numerischen ID´s und den angelegten Labels. Dies vereinfacht die Interpretation der Ergebnisse.

<pre>
labels = [{'name':'ThumbsUp', 'id':1}, {'name':'ThumbsDown', 'id':2}]

with open(files['LABELMAP'], 'w') as f:
    for label in labels:
        f.write('item { \n')
        f.write('\tname:\'{}\'\n'.format(label['name']))
        f.write('\tid:{}\n'.format(label['id']))
        f.write('}\n')
</pre>


#### Erstellen der TFRecord Dateien

Dieser Prozess ist wichtig für die effiziente Datenspeicherung und -verarbeitung in TensorFlow.

<pre>
if not os.path.exists(files['TF_RECORD_SCRIPT']):
    !git clone https://github.com/nicknochnack/GenerateTFRecord {paths['SCRIPTS_PATH']}
  
!python {files['TF_RECORD_SCRIPT']} -x {os.path.join(paths['IMAGE_PATH'], 'train')} -l {files['MAP']} -o {os.path.join(paths['ANNOTATION_PATH'], 'train.record')} 
!python {files['TF_RECORD_SCRIPT']} -x {os.path.join(paths['IMAGE_PATH'], 'test')} -l {files['MAP']} -o {os.path.join(paths['ANNOTATION_PATH'], 'test.record')}
</pre>

#### Erstellen und anpassen der Model config

Hierzu wird die config des vortranierten Models kopiert und die fehlenden Pfade ergänzt.

<pre>
if os.name == 'nt':
    !copy {os.path.join(paths['PRETRAINED_MODEL_PATH'], PRETRAINED_MODEL_NAME, 'pipeline.config')} {os.path.join(paths['CHECKPOINT_PATH'])}
</pre>

#### Installieren von CUDA Toolkit

[CUDA](https://developer.nvidia.com/cuda-toolkit) kann installiert werden um trainieren auf der GPU zu ermöglichen. Dies beschleunigt den Prozess sehr. Die richtige CUDA Version hängt von der Tensorflow Version ab und kann [hier](https://www.tensorflow.org/install/source_windows) nachgeschaut werden. 

### 7. Modeltraining

Folgender Abschnitt generiert den Code, welcher das tranieren auslöst.
*num_train_steps* kann angepasst werden um die Anzahl der Traningssteps zu variieren.

<pre>
TRAINING_SCRIPT = os.path.join(paths['APIMODEL_PATH'], 'research', 'object_detection', 'model_main_tf2.py')
  
command = "python {} --model_dir={} --pipeline_config_path={} --num_train_steps=2000".format(TRAINING_SCRIPT, paths['CHECKPOINT_PATH'],files['PIPELINE_CONFIG'])
  
print(command)
</pre>

Der Command kann innerhalb von juypter oder in einer Konsole mit aktiviter Virtueller Umgebung ausgeführt werden.

### 8. Modelauswertung

[TensorBoard](https://www.tensorflow.org/tensorboard) wird verwendet, um die Trainingsfortschritte und Modelleistungen zu visualisieren.
Es wird mit Befehl innerhalb des /eval Ordners geöffnet werden

<pre>
tensorboard --logdir=.
</pre>

Die Modelleistung wird anhand von Metriken wie Precision, Recall und dem F1-Score bewertet.
Der F1-Score kann errechet werden.

<pre>
f1_score = 2 * (precision * recall) / (precision + recall)
</pre>

[Hier](/README.md#auswertung) eine ausführlichere Auswertung zwischen den Modelen.

### 9.  Erkennung anhand von Bildern

Das trainierte Model wird geladen und mit Testbildern ausgewertet, um zu visualisieren was auf einzellnen Bildern erkannt wurde.

<pre>
img = cv2.imread(IMAGE_PATH)
image_np = np.array(img)

input_tensor = tf.convert_to_tensor(np.expand_dims(image_np, 0), dtype=tf.float32)
detections = detect_fn(input_tensor)

num_detections = int(detections.pop('num_detections'))
detections = {key: value[0, :num_detections].numpy()
              for key, value in detections.items()}
detections['num_detections'] = num_detections

# detection_classes should be ints.
detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

label_id_offset = 1
image_np_with_detections = image_np.copy()

viz_utils.visualize_boxes_and_labels_on_image_array(
            image_np_with_detections,
            detections['detection_boxes'],
            detections['detection_classes']+label_id_offset,
            detections['detection_scores'],
            category_index,
            use_normalized_coordinates=True,
            max_boxes_to_draw=5,
            min_score_thresh=.8,
            agnostic_mode=False)

plt.imshow(cv2.cvtColor(image_np_with_detections, cv2.COLOR_BGR2RGB))
plt.show()
</pre>

Folgende zwei Bilder kamen in der Model_v4 Iteration als Testbilder dazu. 

Hier funktioniert die Erkennung richtig.

![Erkannt](/documentation/pictures/testModelv4ThmubsDownMatch.png)

Hier wird nichts erkannt. Dies könnte an der Schärfe des Bildes, den Lichtverhältnissen oder am trainierten Model liegen.

![Nicht erkannt](/documentation/pictures/testModelv4ThmubsDownNoMatch.png)

### 10. Live-Erkennung mit der Webcam

Das Model wird in Echtzeit mit einer Webcam getestet, um die Reaktionsgeschwindigkeit und Erkennungsgenauigkeit zu überprüfen.

<pre>
cap = cv2.VideoCapture(0)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

while cap.isOpened(): 
    ret, frame = cap.read()
    image_np = np.array(frame)
    
    input_tensor = tf.convert_to_tensor(np.expand_dims(image_np, 0), dtype=tf.float32)
    detections = detect_fn(input_tensor)
    
    num_detections = int(detections.pop('num_detections'))
    detections = {key: value[0, :num_detections].numpy()
                  for key, value in detections.items()}
    detections['num_detections'] = num_detections

    # detection_classes should be ints.
    detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

    label_id_offset = 1
    image_np_with_detections = image_np.copy()

    viz_utils.visualize_boxes_and_labels_on_image_array(
                image_np_with_detections,
                detections['detection_boxes'],
                detections['detection_classes']+label_id_offset,
                detections['detection_scores'],
                category_index,
                use_normalized_coordinates=True,
                max_boxes_to_draw=5,
                min_score_thresh=.8,
                agnostic_mode=False)

    cv2.imshow('object detection',  cv2.resize(image_np_with_detections, (800, 600)))
    
    if cv2.waitKey(10) & 0xFF == ord('q'):
        cap.release()
        cv2.destroyAllWindows()
        break
</pre>

Hier eine Erkennung mit dem **Model_v2**. Wie man sieht werden die Gesten nicht immer korrekt erkannt. Dies liegt an der Drehung der Hand, der Entfernung zur Kamera und eben auch am Model selbst. Es gibt auch falsche Erkennungen.

![examplev2gif](/documentation/pictures/evalModelv2Live.gif)

### 11. Model-Export

#### Einfrieren des Models

Das Model wird eingefroren um es exportieren zu können. Es wird vereinfacht und portabel gemacht. 

<pre>
FREEZE_SCRIPT = os.path.join(paths['APIMODEL_PATH'], 'research', 'object_detection', 'exporter_main_v2.py ')
command = "python {} --input_type=image_tensor --pipeline_config_path={} --trained_checkpoint_dir={} --output_directory={}".format(FREEZE_SCRIPT ,files['PIPELINE_CONFIG'], paths['CHECKPOINT_PATH'], paths['OUTPUT_PATH'])
</pre>
  
#### Exportieren des Models

Das Model wird exportiert, um es in anderen Umgebungen nutzen zu können, wie z.B. in einer auf Node.js basierten Webseite. In diesem Fall zu TensorFlow.js.

<pre>
!pip install tensorflowjs
command = "tensorflowjs_converter --input_format=tf_saved_model --output_node_names='detection_boxes,detection_classes,detection_features,detection_multiclass_scores,detection_scores,num_detections,raw_detection_boxes,raw_detection_scores' --output_format=tfjs_graph_model --signature_name=serving_default {} {}".format(os.path.join(paths['OUTPUT_PATH'], 'saved_model'), paths['TFJS_PATH'])
</pre>

Das Model kann im Anschluss noch für mobile Geräte in TensorFlow Lite konvertiert werden, um eine breitere Anwendbarkeit zu ermöglichen.

## Wiederholung des Vorgangs

Um das Model zu verfeiern kann der Prozess von neuem Durchlaufen werden um eine Verbesserung vorzunehmen. 
Hierzu muss man individuell schauen, ob die Veränderungen die gewünschte Verbesserung erzielt hat.

In diesem Projekt habe ich mein Model in **fünf Zyklen** erstellt.

### Bewertung der einzellnen Modele

Für dieses Projekt interessieren uns Precision, Recall und der F1-Score.

**Precision** gibt an, welcher Anteil der als positiv klassifizierten Fälle tatsächlich positiv ist. Dies ist wichtig um sicherzustellen, dass die erkannten Gesten tatsächlich korrekt sind

**Recall** misst, welcher Anteil der tatsächlichen positiven Fälle vom Model korrekt als positiv erkannt wurde. Dies ist wichtig um zu gewährleisten, dass möglichst alle relevanten Gesten vom System erkannt werden.

Der **F1-Score** ist das Mittel aus Precision und Recall und gibt ein ausgewogenes Maß für die Leistung eines Models, indem es beide Metriken berücksichtigt. Er ist besonders nützlich für die Bewertung der Gesamtleistung des Models.


### Auf welche Metriken haben wir Einfluss:


**Anzahl und Art der Bilder**: Ändern der Position der Hände, Neigen der Hände, verschiedene Lichteinstellungen, Distanz zur Kamera ändern.

**Trainingsteps**: Änderung der Anzahl um Lerneffekt zu erlauben.

**Aufteilung der Trainings und Test Kategorie**: Bilder tauschen und Gewichtung ändern.

### Auswertung

Folgend sind Diagramme mit für uns interessante Werte.

|               | Precision       | Recall        | F1-Score       | 
|:-------------:|:---------------:|:-------------:|:--------------:|
| Model_v0      | 0.7             | 0.7           | 0.7            |
| Model_v1      | 0.6609          | 0.6667        | 0.6638         |
| Model_v2      | 0.7024          | 0.7215        | 0.7118         |
| Model_v3      | 0.8089          | 0.8256        | 0.8172         |
| Model_v4      | 0.7859          | 0.8082        | 0.7969         |


|               | Anzahl Bilder   | Aufteilung Training/Test | Trainingssteps      | 
|:------------: |:---------------:| :-----------------------:| :------------------:|
| Model_v0      | 9               | 6/3        ~67/33%       | 2000                |
| Model_v1      | 41              | 33/8       ~80/20%       | 2000                |
| Model_v2      | 73              | 53/20      ~73/27%       | 2000                |
| Model_v3      | 84              | 59/25      ~70/30%       | 10000               |
| Model_v4      | 114             | 79/35      ~70/30%       | 10000               |

#### Theoretisch

Es ist eine klare Verbesserung der Modellleistung von Model_v0 bis Model_v4 erkennbar.

Die **Zunahme der Bildanzahl** hat einen **positiven Einfluss** auf die Modelleistung.
Hierbei wurde darauf geachtet, Bilder mit variablen Merkmalen zu nutzen wie Handpositionen, Entfernung und Belichtung.

Die **Aufteilung** der von **70/30** hat sich als bewährt herausgestellt.

Die **Erhöhung der Trainingssteps** hat sich als guter Faktor zu **Verbesserung des Gesamtmodels** herausgestellt. Dies wird beim Unterschied zwischen v2 und v3 deutlich.
Hier die Lernrate der Modele:
![learningrate](MSIISNG)

#### Praktisch

Nicht nur theoretisch sonder auch praktisch ist eine Verbesserung zwischen den Modelen bei der Live Kontrolle spürbar.

Durch die Zunahme von Bildern in verschiedenen Handpositionen, Entfernungen und Belichtungen ist das Model besser geworden, diese korrekt zu erkennen.


**Model_v0** Hier wird die Geste nicht erkannt.

![examplev0](/documentation/pictures/testModelv0ThmubsUpNoMatch.png)

**Model_v4** Hier wird die Geste erkannt.

![examplev4](/documentation/pictures/testModelv4ThmubsDownMatch.png)

</details>

<details>
<summary>Model hosten und Webseite bauen</summary>

## Objekterkennungsanwendung Dokumentation

### Grundlage

Die Grundlage ist eine React Webseite. TensorFlow.js und die React-Webcam-Komponente werden genutzt um Objekterkennung in Echtzeit durchzuführen. 

Erkannte Objekte auf einem Videofeed der Webcam an und bietet Benutzern die Möglichkeit, die Darstellung der Erkennungen anzupassen.

Das gehosteten Model kann leicht ausgetauscht werden.

## Grundaufgabe

### Model hosten

Um das Model lokal zu hosten wird das [http-server-Paket](https://www.npmjs.com/package/http-server) genutzt.

Installation per Befehl.

<pre>npm install -g http-server</pre>

Gestartet wird der Server aus dem lokalen Verzeichnis, in dem das Model liegt mittels Befehl.

<pre>http-server -c1 --cors .</pre>

Das Model kann dann über folgenden Code geladen werden.

<pre>const net = await tf.loadGraphModel('http://127.0.0.1:8080/model.json');</pre>

Die model.json Datei enthält Metadaten über das Modell, einschließlich der Struktur des neuronalen Netzwerks und Verweise auf weitere Dateien, die die trainierten Gewichte des Modells enthalten (die .bin-Dateien).

### Zuordnen von Boxen, Klassen und Scores

Das Model sendet acht verschiedene Arrays, für die Zuordnung und Erkennung sind für uns **Bounding Boxes**, **Klassenindizes** und **Scores** interessant.

Diese haben keine feste Zuordnung und sind bei jedem Model anders angeordnet. Es kann z.B. sein, dass sich die **Scores** bei ModelA in Array[0] und bei ModelB in Array[5] sind.
   
Deshalb müssen diese richtig zugeodrnet werden. Dies geschieht im Code

<pre>
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
            }
</pre>

Die **Classes** sind immer Integer.

Die **Scores** sind positive Gleitkommazahlen,.

Die **Boxes** haben genau vier Einträge.

### Erfassen des Bildes von der Webcam und Vorbereiten für das Modell

<pre>
  const video = webcamRef.current.video
  
  const img = tf.browser.fromPixels(video);
  const resized = tf.image.resizeBilinear(img, [640, 480]);
  const casted = resized.cast('int32');
  const expanded = casted.expandDims(0);
</pre>

### Ausführen des Modells und Erhalten der Vorhersagen

<pre>
  const obj = await net.executeAsync(expanded);
</pre>

### Visualisierung

Die Visualisierung findet durch die drawRect Funktion in utilities.js statt.

5. Extra Features: Label werden anhand deren Anzahl geladen und können per Farbe verändert werden 

<pre>
  export const drawRect = (boxes, classes, scores, threshold, imgWidth, imgHeight, ctx, labelMap)=>{
        for(let i=0; i<=boxes.length; i++){
        if(boxes[i] && classes[i] && scores[i]>threshold){
            // extract variables
            const [y,x,height,width] = boxes[i]
            const text = classes[i]
            
            // styling
            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 10
            ctx.fillStyle = 'white'
            ctx.font = '30px Arial'         
            
            // drawing
            ctx.beginPath()
            ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
            ctx.rect(x*imgWidth, y*imgHeight, width*imgWidth/2, height*imgHeight/2);
            ctx.stroke()
        }
    }
}
</pre>

Es werden alle Erkennungen, die über dem mitgegeben *threshold* sind auf einem Canvas gezeichnet. 

Dazu wird über der gezeichneten Box noch das Label mit dem zugehörigen Score angezeigt.

## Weitere Features

### Kontextverwaltung

Mit LabelContext verwaltet die Anwendung globalen Zustand für die Labels. Dies ermöglicht eine einfache Zugriffs- und Aktualisierungsmöglichkeit der Labeldaten über die gesamte Anwendung hinweg.

### LabelList-Komponente (LabelList.js)

Ermöglicht die Anzeige und Anpassung der Labelnamen und -farben auf der rechten Seite der Webseite. Nutzt den LabelContext, um auf die aktuellen Labels zuzugreifen und bietet eine interaktive Schnittstelle zur Farbanpassung durch Klicken auf ein Label.

Labels können leicht im Code angepasst werden und werden dynamisch angezeigt.

<pre>
  const [labels, setLabels] = useState({
    1: {name: 'FirstLabel', color: 'green'},
    2: {name: 'SecondLabel', color: '#000000'},
    3: {name: 'ThirdLabel', color: 'rgb(255, 0, 0)'},
    4: {name: 'FourthLabel', color: 'blue'}
  });
</pre>

![labelsWebsite](/documentation/pictures/labelsWebsite.png)

### Ändern der Farbe der Labels

Auf das Label klicken, bei der die Anzeigefarbe geändert werden soll.

![changeLabelcolor](/documentation/pictures/changeLabelcolor.png)

Es erscheint ein Fenster in dem die neue Farbe eingegeben werden kann. Dies kann mittels des englischen Wortes, dem HEX oder RGB Wert passieren.

![changeLabelcolorDialog](/documentation/pictures/changeLabelcolorDialog.png)

![changeLabelcolorAfter](/documentation/pictures/changeLabelcolorAfter.png)

### LoadingIndicator-Komponente (LoadingIndicator.js)

Zeigt einen Ladeindikator für User Feedback an, während das Modell geladen wird. Visualisiert den Ladezustand durch einen animierten Spinner.

### ProgressCircle-Komponente (ProgressCircle.js)

Visualisiert den Fortschritt der Zuweisung von Bounding Boxes, Klassenindizes und Scores durch einen sich füllenden Kreis.

### Messages

Um weiteres visuelles Feedback zu geben können kleine Nachrichten auf verschiedenen Hintergründen angezeigt werden, welche nach fünf Sekunden wieder verschwinden.

<pre>
  useEffect(() => {
    if (displayMessage.hasMessage) {
      const timer = setTimeout(() => {
        setDisplayMessage({ hasMessage: false, message: "" , color: ""});
      }, 5000);    
      return () => clearTimeout(timer);
      }
  }, [displayMessage.hasMessage]);
</pre>

Hier ein kompletter Vorgang mit LoadingIndicator und ProgressCircle und Mesages.

![gif of loading the model and arrays](/documentation/pictures/LoadingProzzes.gif)

### StatusIndicator-Komponente (StatusIndicator.js)

Bietet dauerhaftes visuelles Feedback über den Ladezustand des Modells und die Zuweisung der Arrays auf der linken Seite der Webseite. Zeigt an, ob das Modell geladen wurde und ob die Objektboxen erfolgreich zugewiesen wurden.

![StatusIndicator](/documentation/pictures/StatusIndicator.png)
### Styling

Die Anwendung nutzt CSS für das Styling der Komponenten und des Layouts. Die Hauptstyle-Datei ist App.css, welche allgemeine Styles und Layoutanpassungen definiert.

</details>

<details>
<summary>3. Projekt in einen Docker Container umsiedeln</summary>
</details>
