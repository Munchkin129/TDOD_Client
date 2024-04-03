## Praxisprojekt Object Detection mit Webseitenanbindung

## Starten der Webseite und des Models
<details open>
<summary> </summary>
<ol>
<li><strong>Dependencies installieren</strong></li>
  <p>In der Konsole: <br>
  <pre>npm install</pre></p>
<li><strong>Webseite starten</strong></li>
  <p>In der Konsole: <br>
  <pre>npm start </pre></p>
<li><strong>Model lokal hosten</strong></li>
  <p>In den Ordner des zu hostenden Models gehen, Konsole öffnen und http Server starten:<br>
    <pre>http-server -c1 --cors .</pre></p>
</ol>
</details>

## Durchführung der einzelnen Schritte
<details>
<summary>1. Tranieren des Tensorflow Model</summary>
</details>

# TensorFlow Modell Trainingsdokumentation

Diese Dokumentation beschreibt den Prozess des Trainierens eines TensorFlow-Modells, von der Einrichtung der Entwicklungsumgebung über das Sammeln von Bildern bis hin zum Export des Modells für die Verwendung in unterschiedlichen Umgebungen.

## 1. Einrichtung der Entwicklungsumgebung

Zu Beginn wird eine virtuelle Umgebung erstellt, um Paketkonflikte zu vermeiden. Das komplette Training findet in jupyter Notebook statt.
Eine virtuelle Umgebung wird erstellt, und die notwendigen Abhängigkeiten werden installiert, um eine stabile Entwicklungsumgebung sicherzustellen.

<pre>
!pip install opencv-python
import cv2
import uuid
import os
import time
</pre>

## 2. Sammeln und Labeln der Bilder

Hier werden die Labels festgelegt. Es werden Bilder von zwei Handgesten ("Daumen hoch" und "Daumen runter") gesammelt. Die Bilder werden mit der integrierten Webcam des Laptops aufgenommen.
*number_imgs* gibt an, wie viele Bilder aufgenommen werden sollen.

<pre>
labels = ['thumbsup', 'thumbsdown']
number_imgs = 5
</pre>

## 3. Ordnerstruktur vorbereiten

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

Daraus resultiert diese übersichtliche Struktur:
![folder structure](/documentation/pictures/folderstructure.png)

## 4. Bilderfassung

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

## 5. Bilder beschriften

Das Tool [LabelImg](https://pypi.org/project/labelImg/) wird installiert und verwendet, um die Bilder zu beschriften und die entsprechenden Label-Daten vorzubereiten.
LabelImg ist ein grafisches Tool zur manuellen Beschriftung von Objekten in Bildern, das die Erstellung von Trainingsdaten für Bilderkennungsmodelle erleichtert.

<pre>
!pip install --upgrade pyqt5 lxml
</pre>

## 6. Vorbereitung des Trainings

Vor der Durchführung des Tranings werden die gelabelten Bilder in die zwei Kategorien **Training** und **Test** eingeteilt.
Das Modell wird auf den Trainingsdateien generiert und anhand der Testbilder evaluiert. Dies greift eine Überanpassung vorweg und gibt Aufschluss auf eine tatsächliche Effektivität des Modells in der Praxis.

Als nächstes werden notwendigen Pfade und Dateinamen für das Modelltraining werden festgelegt. Dazu gehören Arbeitsverzeichnisse, Skripte, API-Modelle, Annotationen und Bilder sowie Pfade für die vorab trainierten Modelle.

<pre>
CUSTOM_MODEL_NAME = 'my_ssd_mobnet' 
PRETRAINED_MODEL_NAME = 'ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8'
PRETRAINED_MODEL_URL = 'http://download.tensorflow.org/models/object_detection/tf2/20200711/ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8.tar.gz'
</pre>

Bei *PRETRAINED_MODEL_NAME* handelt es sich um ein vortrainiertes und bewährtes TensorFlow Zoo Model. Durch den Einsatz dieses wird der Entwicklungsprozess erheblich beschleunigt. 

## 7. Modelltraining

Vor Beginn wird [CUDA Deep Neutral Network](https://developer.nvidia.com/cuda-toolkit) installiert. Dies ermöglicht es auf der GPU zu trainieren. Die richtige CUDA Version hängt von der Tensorflow Version ab und kann [hier](https://www.tensorflow.org/install/source_windows) nachgeschaut werden. 

Das Modell wird mit den definierten Einstellungen und Parametern trainiert. Ein vorab trainiertes Modell aus dem TensorFlow Model Zoo wird beschleunigt, um den Entwicklungsprozess zu verkürzen.
WEITER
<pre>
!python model_main_tf2.py --model_dir=models/my_ssd_mobnet --pipeline_config_path=models/my_ssd_mobnet/pipeline.config
</pre>

## 8. Modellauswertung

Die Modellleistung wird anhand von Metriken wie Precision, Recall und dem F1-Score bewertet. TensorBoard wird verwendet, um die Trainingsfortschritte und Modellleistungen zu visualisieren.

<pre>
precision = 0.7859           
recall = 0.8082
f1_score = 2 * (precision * recall) / (precision + recall)
print(f'F1 Score: {f1_score}')
</pre>

## 9. Modell laden und Testbilder auswerten

Das trainierte Modell wird geladen und mit Testbildern ausgewertet, um die Leistung zu beurteilen.

<pre>
# Code für das Laden des Modells und die Anwendung auf Testbilder
</pre>

## 10. Live-Erkennung mit der Webcam

Das Modell wird in Echtzeit mit einer Webcam getestet, um die Reaktionsgeschwindigkeit und Erkennungsgenauigkeit zu überprüfen.

<pre>
# Code für die Live-Erkennung mit der Webcam
</pre>

## 11. Modell-Export

Das Modell wird exportiert, um es in anderen Umgebungen nutzen zu können, wie z.B. in einer auf Node.js basierten Webseite. In diesem Fall zu TensorFlow.js.

<pre>
!pip install tensorflowjs
# Befehl zum Konvertieren des Modells in das TensorFlow.js-Format
</pre>

## 12. Modellkonvertierung für TFLite

Das Modell kann im Anschluss noch für mobile Geräte in TensorFlow Lite konvertiert werden, um eine breitere Anwendbarkeit zu ermöglichen.

<pre>
# Befehle für die Konvertierung des Modells in das TFLite-Format
</pre>


1. Installation und Setup
Für das Trainieren eines eigenen Tensorflow Models muss zuerst eine Basis geschaffen werden.
In dieserm Projekt verwende ich eine virtuelle Umgebung und jupyter Notebooks mit Python als diese.
Die virtuelle Umgebung gibt uns den Vorteil

3. Trainieren des Models mittels Tensorflow
Voraussetzung für das Tranieren ist die Installation von 'Tensorflow Object Detection'.
Um zusätzlich auf der GPU tranieren zu können wurde CUDA Deep Neutral Network installiert. Somit wird nicht nur auf der CPU traniert und der Prozess verschnellert sich.
Der Entwicklungsprozess wurde durch den Einsatz des vortrainierten und bewährter TensorFlow Zoo Modell 'ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8' erheblich beschleunigt.
Als nächstes wurde die LabelMap angelegt. Diese dient er klaren Zuordnung zwischen numerischen ID´s und den angelegten Labeln. Dies vereinfacht die Interpretation der Ergebnisse.
Für die Durchführung des Tranings werden die gelabelten Bilder in die zwei Kategorien Training und Test eingeteilt.
Das Modell wird nun auf den Trainingsdateien generiert und anhand der Testbilder evaluiert. Dies greift eine Überanpassung vorweg und gibt Aufschluss auf eine tatsächliche Effektivität des Modells in der Praxis.

4. Auswertung des Models
Die Auswertung des Models erfolgt mittels Tensorboard. Dies ermöglicht eine Visualisierung verschiedener Kategorien und ein schnelleres Verständnis anhand Skalenwerten.
Tensorboard kann mit folgedem Befehl innerhalb des /eval Ordners geöffnet werden
<pre>tensorboard --logdir=.</pre>
Alternativ kann auch ein Command zur Bewertung genutzt werden.
Hervorzuheben sind Precision, Recall und der F1-Score.
Precision gibt an, welcher Anteil der als positiv klassifizierten Fälle tatsächlich positiv ist. Dies ist wichtig um sicherzustellen, dass die erkannten Gesten tatsächlich korrekt sind
Recall misst, welcher Anteil der tatsächlichen positiven Fälle vom Modell korrekt als positiv erkannt wurde. Dies ist wichtig um zu gewährleisten, dass möglichst alle relevanten Gesten vom System erkannt werden.
Der F1-Score ist das Mittel aus Precision und Recall und gibt ein ausgewogenes Maß für die Leistung eines Modells, indem es beide Metriken berücksichtigt. Er ist besonders nützlich für die Bewertung der Gesamtleistung des Models.

Auf welche Metriken haben wir Einfluss:


Anzahl und Art der Bilder: Ändern der Position der Hände, Neigen der Hände, verschiedene Lichteinstellungen, Distanz zur Kamera ändern.
Trainingsteps: Änderung der Anzahl, bei mehr Steps dauert das Training länger
Aufteilung der Trainings und Test Kategorie: Bilder tauschen und Gewichtung ändern

|               | Precision       | Recall        | F1-Score       | 
|:-------------:|:---------------:|:-------------:|:--------------:|
| Model_v0      | 0.7             | 0.7           | 0.7            |
| Model_v1      | 0.6609          | 0.6667        | 0.6638         |
| Model_v2      | 0.7024          | 0.7215        | 0.7118         |
| Model_v3      | 0.8089          | 0.8256        | 0.8172         |
| Model_v4      | 0.7859          | 0.8082        | 0.7969         |


Anhand der Auswertung der Modelle konnte ich so Einfluss auf Precision und Recall nehmen.

|               | Anzahl Bilder   | Aufteilung Training/Test | Trainingssteps      | 
|:------------: |:---------------:| :-----------------------:| :------------------:|
| Model_v0      | 9               | 6/3        ~67/33%       | 2000                |
| Model_v1      | 41              | 33/8       ~80/20%       | 2000                |
| Model_v2      | 73              | 53/20      ~73/27%       | 2000                |
| Model_v3      | 84              | 59/25      ~70/30%       | 10000               |
| Model_v4      | 114             | 79/35      ~70/30%       | 10000               |

5. Testen des Models anhand Bildern und Livevideo
Um nun praktisch zu sehen wie sich das tranierte Model verhält, können entweder einzellne Bilder geladen und auf diese wird dann das erkannte mit Gewichtung gezeichnet.
So können Rückschlüsse auf das Model genommen werden. Folgende zwei Bilder kamen in der Model_v4 Iteration dazu. Bei einem wird der Daumen nach unten erkannt, bei dem anderen nicht.
![Erkannt](/documentation/pictures/testModelv4ThmubsDownMatch.png)
![Nicht erkannt](/documentation/pictures/testModelv4ThmubsDownNoMatch.png)

Alternativ kann auch ein Livevideo über die Webcam gestartet werden um Live Auswertungen zu bekommen.
Hier kann getestet werden, wie schnell das System die Handgesten erkennt.


7. Wiederholung der vorherigen Schritte und Anpassungen vornhemen.
Um das Model zu verfeiern kann der Prozess von neuem Durchlaufen werden um eine Verbesserung vorzunehmen. Hierzu muss man individuell schauen, ob die Veränderungen die gewünschte Verbesserung erzielt hat. Mehr Bilder oder mehr Trainingssteps bedeuten nicht automatisch eine Verbesserung.

8. Exportieren des Models
Um das Model nun in anderen Umgebungen nutzen möchte muss dieses zunächst eingefroren und dann exportiert werden.
Da die Webseite auf Node.js basiert, wird das Model nach Tensorflow.js(tfjs) exportiert.
Dies sieht hat folgende Strukur: 
![model.json und shards](/documentation/pictures/tfjsexport.png)
Die model.json Datei definiert die Struktur eines TensorFlow.js Modells, und die group1-shardXof3.bin Dateien enthalten die aufgeteilten Gewichte des Modells für effizientes Laden und Hosting-Kompatibilität.


<details>
<summary>2. Webseite schreiben und Model anbinden</summary>
</details>

1. Model hosten
   mehrere Möglichkeiten, habe mich zum lokalen hosten entschieden mittels http server (https://www.npmjs.com/package/http-server)
   individuelle Challenge: jedes geladene Model sendet 8 Arrays in verschiedener Reihenfolge
   Wir brauchen Boxes, Classes und Scores und müssen diese richtig zuordnen. Dafür habe ich einen Algorithmus geschrieben
   
Beim Laden des Modells im Client-Browser wird zuerst die model.json-Datei abgerufen, um die Modellstruktur zu konstruieren. Anschließend werden die zugehörigen Gewichte aus den .bin-Dateien geladen, um das Modell zu vervollständigen und inferenzbereit zu machen.

3. Webcam für live Feed

4. Canvas für die Liveauswertung

5. Extra Features: Label werden anhand deren Anzahl geladen und können per Farbe verändert werden 


<details>
<summary>3. Projekt in einen Docker Container umsiedeln</summary>
</details>
