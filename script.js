// Zugriff auf die Webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function(stream) {
    var video = document.getElementById('webcam');
    // Verknüpfung des Video-Elements mit dem Stream der Webcam
    video.srcObject = stream;
  })
  .catch(function(err) {
    console.error('Fehler beim Zugriff auf die Webcam: ' + err);
  });

