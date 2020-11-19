const { ipcRenderer } = require('electron');

let volume = '1';
let format = 'mp4';
let videoCodec = 'libx264';
let audioCodec = 'aac';

const videoSource = document.getElementById('source');

const volumes = document.getElementsByName('volume');
const audioCodecs = document.getElementsByName('audio-codecs');
const videoCodecs = document.getElementsByName('video-codecs');
const formats = document.getElementsByName('format');

volumes.forEach((vol) => {
    vol.addEventListener('change', function (event) {
        if (event.target.checked) {
            volume = event.target.value;
        }
    });
});

audioCodecs.forEach((codec) => {
    codec.addEventListener('change', function (event) {
        if (event.target.checked) {
            audioCodec = event.target.value;
        }
    });
});

formats.forEach((f) => {
    f.addEventListener('change', function (event) {
        if (event.target.checked) {
            format = event.target.value;
        }
    });
});

videoCodecs.forEach((codec) => {
    codec.addEventListener('change', function (event) {
        if (event.target.checked) {
            videoCodec = event.target.value;
        }
    });
});

// Inputs
const customFile = document.getElementById('customFile');

// Buttons
const btnConvert = document.getElementById('convert');
const btnExtractVideo = document.getElementById('extract-video');
const btnExtractAudio = document.getElementById('extract-audio');

let filePath;

customFile.addEventListener('change', function (event) {
    if (event.target.files.length === 0) {
        return;
    }
    const path = event.target.files[0].path;
    videoSource.src = path;
    filePath = path;
    document.querySelector('video').load();
});

// Extract audio
btnExtractAudio.addEventListener('click', function () {
    ipcRenderer.send('extract-audio', { filePath, volume });
});

// Extract viedo
btnExtractVideo.addEventListener('click', function () {
    ipcRenderer.send('extract-video', filePath);
});

btnConvert.addEventListener('click', function () {
    ipcRenderer.send('convert', {
        filePath,
        volume,
        audioCodec,
        videoCodec,
        format,
    });
});
