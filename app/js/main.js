var userAudio = document.getElementById('openFile');
var arrayBuffer;

userAudio.onchange = function (e) { //Converts an uploaded file into an Array Buffer
    files = this.files;
    
    var reader = new FileReader();

    reader.onload = function(e) {
        arrayBuffer = reader.result;
        console.log(reader.result);
    }
    reader.readAsArrayBuffer(files[0]);

    setupVisualizer();
}

function setupVisualizer() {
    if (!window.AudioContext) {
        if (!window.webkitAudioContext) {
            alert('No Audio Context Found.');
        }
        window.AudioContext = window.webkitAudioContext;
    }
    var audioCtx = new AudioContext();
    var audioBuffer;
    
    var sourceNode = audioCtx.createBufferSource();
    sourceNode.connect(audioCtx.destination);
    console.log(audioCtx.destination);

    audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
        sourceNode.buffer = buffer;
        sourceNode.start(0);
    }, function(e) {
        throw e;
    });
    
}
