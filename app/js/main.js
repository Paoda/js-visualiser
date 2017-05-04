var ctx = new AudioContext(); //works on chrome idk about any other browser
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

    fileLoaded = true;
}

function setupVisualiser() {
    
}
