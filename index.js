const { app, BrowserWindow, ipcMain } = require('electron');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

let mainWindow = null;
let popupWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        resizable: false,
        icon: './dist/img/icon.png',
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow.removeMenu();
    mainWindow.loadFile('index.html');
}

function createPopupWindow() {
    popupWindow = new BrowserWindow({
        width: 600,
        height: 300,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    popupWindow.loadFile('popup.html');
}

function sendProgress(progress) {
    const prg = Math.floor(progress.percent) + 1;
    popupWindow.webContents.send('send-progress', prg);
}

ipcMain.on('extract-audio', function (error, { filePath, volume }) {
    const command = ffmpeg(filePath);
    createPopupWindow();
    const output = filePath.split('.');
    output.pop();
    const outputPath = output.join('');
    command
        .noVideo()
        .format('mp3')
        .audioFilters(`volume=${volume}`)
        .output(outputPath + '-audio.mp3')
        .on('progress', sendProgress);
    command.run();
    ipcMain.on('cancel', function (error, data) {
        command.kill();
        popupWindow.close();
        popupWindow = null;
    });
});

ipcMain.on('extract-video', function (error, filePath) {
    const command = ffmpeg(filePath);
    createPopupWindow();
    const output = filePath.split('.');
    output.pop();
    const outputPath = output.join('');
    command
        .noAudio()
        .format('mp4')
        .output(outputPath + '-video.mp4')
        .on('progress', sendProgress);
    command.run();
    ipcMain.on('cancel', function (error, data) {
        command.kill();
        popupWindow.close();
        popupWindow = null;
    });
});

ipcMain.on('convert', function (error, payload) {
    const { filePath, volume, audioCodec, videoCodec, format } = payload;
    const command = ffmpeg(filePath);
    createPopupWindow();
    const output = filePath.split('.');
    output.pop();
    const outputPath = output.join('');
    command
        .format(format)
        .audioCodec(audioCodec)
        .audioFilters(`volume=${volume}`)
        .videoCodec(videoCodec)
        .output(outputPath + '-converted.' + format)
        .on('progress', sendProgress);
    command.run();
    ipcMain.on('cancel', function (error, data) {
        command.kill();
        popupWindow.close();
        popupWindow = null;
    });
});

ipcMain.on('close-popup', function (error, data) {
    popupWindow.close();
    popupWindow = null;
});

app.on('ready', createWindow);
