"use strict";

// Style Constants
const canvasFont = "25px Consolas";
const bgColour = "#F1F0FF"
const curveEnabled = true;
let isPlaying = false;
let lessJumpy = true;



const audio = new Audio();
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
const bars = 100;

analyser.fftSize = 4096;

const canvas = document.createElement("canvas");
const canvasCtx = canvas.getContext("2d");
canvas.id = "visualiser";
canvas.draggable = true;
document.body.appendChild(canvas);
resize();

// Chrome 71 Requires that A User Must Interact with the 
// Browser Before AudioContext can work.
// As such we call context.resume() once we know the user has
// interacted with the browser.

document.addEventListener("click", () => audioCtx.resume().then(() => console.log("Audio Context succesfully resumed.")))

window.addEventListener("load", () => {
  const source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  visualize();
});

window.addEventListener("resize", resize, false);


function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

//Canvas Events START
canvas.onclick = () => {
  lessJumpy = !lessJumpy;
};

canvas.ondragover = e => e.preventDefault();

canvas.ondrop = e => {
  const notAudioText = "File Uploaded was not an Audio File";
  e.preventDefault();

  let dt = e.dataTransfer;

  if (dt.items) {
    for (let i = 0; i < dt.items.length; i++) {
      if (dt.items[i].kind === "file") {
        let file = dt.items[i].getAsFile();

        if (file.type.match(/audio/gi)) {
          audio.src = window.URL.createObjectURL(file);
          audio.play();
          isPlaying = true;
        } else throw TypeError(notAudioText);
      } else throw TypeError(notAudioText);
    }
  } else {
    if (dt.files.length > 1) {
      console.log("Not a Item");
      let file = dt.files[0];

      if (file.type.match(/audio/gi)) {
        audio.src = window.URL.createObjectURL(file);
        audio.play();
        isPlaying = true;
      } else throw TypeError(notAudioText);
    }
  }
};

canvas.ondragend = e => {
  let dt = e.dataTransfer;
  if (dt.items) {
    for (let i = 0; i < dt.items.length; i++) {
      dt.items.remove(i);
    }
  } else {
    dt.clearData();
  }
};

canvas.ondblclick = e => {
  e.preventDefault();
  let input = document.createElement("input");
  input.type = "file";

  let event = document.createEvent("MouseEvents");
  event.initEvent("click", true, false);
  input.dispatchEvent(event);

  input.onchange = e => {
    let file = input.files[0];

    if (file.type.match(/audio/gi)) {
      audio.src = window.URL.createObjectURL(file);
      audio.play();
      isPlaying = true;
    } else throw TypeError("File Uploaded was not an Audio File");
  };
};

//Canvas Events END

function visualize() {
  const bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);
  const dataArray = new Uint8Array(bufferLength);
  canvasCtx.font = canvasFont;
  let dataPerBar = ~~(dataArray.length / bars);
  if (dataPerBar < 1) dataPerBar = 1;
  const barWidth = ~~(canvas.width / bars);
  let avgFrameTime = [];

  function draw() {
    const t1 = performance.now();

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    const drawVisual = requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    
    canvasCtx.fillStyle = bgColour;
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    let barHeight, x = 0, index = 0;
    
    const applyCurve = val => (curveEnabled) ? Math.pow(Math.E, val) : val;

    for (var i = 0; i < bars; i++) {
      // if (i == 0) debugger;
      let res = average(dataArray, index, dataPerBar);
      index = res[1];

      barHeight = applyCurve(res[0]);

      if (!lessJumpy) barHeight = barHeight * 0.5

      if (barHeight > canvas.height) canvas.height / barHeight;

      canvasCtx.fillStyle = "rgb(75,0," + (barHeight + 100) + ")";

      if (i == 1) canvasCtx.fillText(`Bar #2 Value: ${res[0]}`, 30, 50)

      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 2;
    }
    canvasCtx.fillStyle = "#000000";


    if (isPlaying) {
      if (avgFrameTime.length > 100) avgFrameTime = [];
      avgFrameTime.push(performance.now() - t1);

      let fps = ~~(1000 / (avgFrameTime.reduce((a, b) => a + b) / avgFrameTime.length));
      canvasCtx.fillText(`${fps}fps`, 30, 30);
    } else {
      let startMsg = "Drag & Drop or Double Click to Start!"
      canvasCtx.fillText(startMsg, (canvas.width / 2) - canvasCtx.measureText(startMsg).width, canvas.height / 2)
    }
  }
  draw();
}

function average(dataArr, index, dataPerBar) {


  const start = index;
  let total = 0;
  while (index < start + dataPerBar) {
    total += dataArr[index];
    index++;
  }

  return [total / dataPerBar, index];
}

