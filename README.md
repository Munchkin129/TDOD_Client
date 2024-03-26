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
Das Modell wird nun auf den Trainingsdateien TODOOOOOOOOOO

5. Auswertung des Models
   Änderungen des Models durch Veränderung der Anzahl der Bilder, Steps, etc möglich

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
