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

1. Installation und Setup
Für das Trainieren eines eigenen Tensorflow Models muss zuerst eine Basis geschaffen werden.
In dieserm Projekt verwende ich eine virtuelle Umgebung und jupyter Notebooks mit Python als diese.
Die virtuelle Umgebung gibt uns den Vorteil, TODO

2. Sammeln und Labeln der Bilder
Ich habe mich dafür entschieden die Webcam meines Laptops für das aufzeichnen der Bilder zu benutzen.
Für das Labeln der Bilder wurde LabelImg benutzt. Dies bietet ein leicht verständliches Interface mit leicht zu lernender Bedienung.

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

|               | Precision       | Recall        | F1-Score      | 
|:------------: |:---------------:| :------------:| :------------:|
| Model_v0      |          0.7    |          0.7  |               |
| Model_v1      |    0.6609       |    0.6667     |               |
| Model_v2      | 0.7024          |  0.7215       |               |
| Model_v3      |          0.8089 |        0.8256 |               |
| Model_v4      |          0.0000 |        0.0000 |               |

Anhand der Auswertung der Modelle konnte ich so Einfluss auf Precision und Recall nehmen.

|               | Anzahl Bilder   | Aufteilung Training/Test | Trainingssteps      | 
|:------------: |:---------------:| :-----------------------:| :------------------:|
| Model_v0      | Cell 2          | Cell 3                   |           2000      |
| Model_v1      | Cell 5          | Cell 6                   |           2000      |
| Model_v2      | Cell 8          | Cell 9                   |               2000  |
| Model_v3      | 84              |  59/25       ~70/30%     |            10000    |
| Model_v4      | 114             |  79/35       ~70/30%     |            10000    |

5. Testen des Models anhand Bildern und Livevideo

6. Wiederholung der vorherigen Schritte und Anpassungen vornhemen.
Um das Model zu verfeiern kann der Prozess von neuem Durchlaufen werden um eine Verbesserung vorzunehmen. Hierzu muss man individuell schauen, ob die Veränderungen die gewünschte Verbesserung erzielt hat. Mehr Bilder oder mehr Trainingssteps bedeuten nicht automatisch eine Verbesserung.

7. Exportieren des Models
Um das Model nun in anderen Umgebungen nutzen möchte muss dieses zunächst eingefroren und dann exportiert werden.
TODO zu Tensorflow JS

<details>
<summary>2. Webseite schreiben und Model anbinden</summary>
</details>

1. Model hosten
   mehrere Möglichkeiten, habe mich zum lokalen hosten entschieden mittels http server (https://www.npmjs.com/package/http-server)
   individuelle Challenge: jedes geladene Model sendet 8 Arrays in verschiedener Reihenfolge
   Wir brauchen Boxes, Classes und Scores und müssen diese richtig zuordnen. Dafür habe ich einen Algorithmus geschrieben

3. Webcam für live Feed

4. Canvas für die Liveauswertung

5. Extra Features: Label werden anhand deren Anzahl geladen und können per Farbe verändert werden 


<details>
<summary>3. Projekt in einen Docker Container umsiedeln</summary>
</details>
