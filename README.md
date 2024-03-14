## Starten der Webseite und des Models
<details open>
<summary> </summary>
<ol>
<li><strong>Dependencies installieren</strong></li>
  <p>In der Konsole: <br>
  npm install</p>
<li><strong>Webseite starten</strong></li>
  <p>In der Konsole: <br>
  npm start</p>
<li><strong>Model lokal hosten</strong></li>
  <p>In den Ordner des zu hostenden Models gehen, Konsole öffnen und http Server starten:<br>
    http-server -c1 --cors .</p>
</ol>
</details>

## Praxisprojekt Object Detection mit Webseitenanbindung
<details>
<summary>Tranieren des Tensorflow Model</summary>
</details>
In jupyter Notebooks

1. Sammeln und Labeln der Bilder

2. Trainieren des Models
  in zwei Bereiche einteilen Training/Testing

3. Auswertung des Models
   Änderungen des Models durch Veränderung der Anzahl der Bilder, Steps, etc möglich

<details>
<summary>Webseite schreiben und Model anbinden</summary>
</details>

1. Model hosten
   mehrere Möglichkeiten, habe mich zum lokalen hosten entschieden mittels http server (https://www.npmjs.com/package/http-server)
   individuelle Challenge: jedes geladene Model sendet 8 Arrays in verschiedener Reihenfolge
   Wir brauchen Boxes, Classes und Scores und müssen diese richtig zuordnen. Dafür habe ich einen Algorithmus geschrieben

3. Webcam für live Feed

4. Canvas für die Liveauswertung

5. Extra Features: Label werden anhand deren Anzahl geladen und können per Farbe verändert werden 


<details>
<summary>Projekt in einen Docker Container umsiedeln</summary>
</details>
