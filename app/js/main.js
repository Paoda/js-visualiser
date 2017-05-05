var userAudio = document.getElementById('openFile');
var arrayBuffer;

var audio = new Audio();

var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();

window.addEventListener('load', function (e) {
    var source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    visualize();
})

userAudio.onchange = function (e) { //Converts an uploaded file into an Array Buffer
    files = this.files[0]; //This is all literally so that I can bypass CORS

    audio.src = window.URL.createObjectURL(files);
    audio.play();
}

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var intendedWidth = document.querySelector('.wrapper').clientWidth;
canvas.setAttribute('width', intendedWidth);

var drawVisual;

function visualize() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    console.log("Width: " + WIDTH);
    console.log("Height: " + HEIGHT)

    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
        drawVisual = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT );

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];


            canvasCtx.fillStyle = 'rgb(75,0,130)';
            canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    };

    draw();
}