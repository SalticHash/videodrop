const videoDropTime__Input = document.getElementById('video_drop_time');
const videoDropMinutes__Input = videoDropTime__Input.querySelector('.minutes');
const videoDropSeconds__Input = videoDropTime__Input.querySelector('.seconds');
const videoDropMiliseconds__Input = videoDropTime__Input.querySelector('.miliseconds');

const messageParagraph = document.getElementById('message');
const targetPlayTime__Input = document.getElementById('target_play_time');
const videoFile__Input = document.getElementById('video_file');
const warningContainer = document.getElementById('warning_container');
const video = document.getElementById('video');
const best_played_by = document.getElementById('play_by');

const dropTimeToCurrentButton = document.getElementById('drop_time_current')
const startButton = document.getElementById('start_button')
const stopButton = document.getElementById('stop_button')
const adjustLeft = document.getElementById('adjust_left')
const adjustRight = document.getElementById('adjust_right')
const interval__Input = document.getElementById('adjust_interval')

adjustLeft.addEventListener('click', () => video.currentTime -= parseFloat(interval__Input.value))
adjustRight.addEventListener('click', () => video.currentTime += parseFloat(interval__Input.value))

function calculateTargetPlayTime() {
    let time = targetPlayTime__Input.value;
    if (!time.match(/\d\d:\d\d/g)) return;

    let [minutes, seconds] = time.split(':');
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);

    let playTimeDate = new Date();
    playTimeDate.setHours(minutes, seconds, 0, 0);

    return playTimeDate.getTime();
}

function calculateVideoDropTime() {
    let minutes = parseInt(videoDropMinutes__Input.value);
    let seconds = parseInt(videoDropSeconds__Input.value);
    let miliseconds = parseInt(videoDropMiliseconds__Input.value);

    if (isNaN(minutes)) minutes = 0;
    if (isNaN(seconds)) seconds = 0;
    if (isNaN(miliseconds)) miliseconds = 0;

    let totalMilimiliseconds = (minutes * 60 + seconds) * 1000 + miliseconds;
    return totalMilimiliseconds;
}

videoDropTimeEvents()
function videoDropTimeEvents() {
    function videoDropTimeInputSelectionChange(e) {
        const input = e.target;
        const length = input.value.length;
        input.setSelectionRange(length, length);
    }
    
    function videoDropTimeInput(e, max = 59) {
        const charAdded = e.data;
        const input = e.target;
        const value = input.value;

        const isMinutes = input.classList.contains('minutes');
        const isSeconds = input.classList.contains('seconds');
        const isMiliseconds = input.classList.contains('miliseconds');

        if (isMinutes) max = 9999;
        if (isMiliseconds) max = 999;
        
        let numberAdded = parseInt(charAdded);
        let currentValue = parseInt(value);

        const maxDigits = max.toString().length;
        const digits = currentValue.toString().length;
        if (digits == maxDigits) {
            if (isMinutes) videoDropSeconds__Input.focus();
            if (isSeconds) videoDropMiliseconds__Input.focus();
        }

        if (isNaN(currentValue)) currentValue = 0;
        if (isNaN(numberAdded)) numberAdded = 0;
        if (currentValue > max) currentValue = numberAdded;
        input.value = currentValue.toString().padStart(maxDigits, '0');
        valueInput();
    }

    videoDropTime__Input.addEventListener('selectionchange', videoDropTimeInputSelectionChange);
    videoDropTime__Input.addEventListener('input', videoDropTimeInput);
}

let videoDropTime = undefined;
let targetPlayTime = undefined;
let videoFile = undefined;

// let startTime = Date.now();
let currentTime = undefined;//new Date(2024, 11, 31, 23, 59, 50).getTime() + (Date.now() - startTime);
let cancelLoop = false;

targetPlayTime__Input.addEventListener('input', valueInput);
videoFile__Input.addEventListener('input', valueInput);

const hide = (element) => element.classList.add('hidden')
const show = (element) => element.classList.remove('hidden')

dropTimeToCurrentButton.addEventListener('click', dropTimeToCurrent);
function dropTimeToCurrent() {
    // time in milliseconds
    let time = video.currentTime * 1000;
    let milliseconds = time % 1000;
    let seconds = Math.floor(time / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    videoDropMinutes__Input.value = minutes.toString().padStart(4, '0');
    videoDropSeconds__Input.value = seconds.toString().padStart(2, '0');
    videoDropMiliseconds__Input.value = milliseconds.toString().padStart(3, '0');
    
    valueInput();
}


function warn(warningText, fadeDelay = 2500, fadeDuration = 1000) {
    let warning = document.createElement('div');
    warning.textContent = warningText;
    warningContainer.appendChild(warning);
    setTimeout(() => warning.classList.add(`fade-${fadeDuration}`), fadeDelay);
    setTimeout(() => warning.remove(), fadeDelay + fadeDuration);
}

function valueInput() {
    cancelLoop = true;

    videoDropTime = calculateVideoDropTime();
    targetPlayTime = calculateTargetPlayTime();
    let newVideoFile = videoFile__Input.files[0];

    let timeSyncText = new Date(targetPlayTime - videoDropTime).toLocaleTimeString();
    best_played_by.textContent = `Please start before ${timeSyncText}, so the drop syncs smoothly with the video`;
    
    if (!newVideoFile || !newVideoFile.type.match(/video/)) {
        hide(video);
        warn('Please select a video file');
        return;
    }
    
    if (videoFile == newVideoFile) return;

    videoFile = newVideoFile;

    var reader = new FileReader();
    reader.readAsDataURL(videoFile);
    reader.onload = (event) => {
        let videoContent = event.target.result;
        video.src = videoContent;
        show(video);
    }
}



function displayTimeLeft(miliseconds) {
    if (miliseconds < 0) return 'Started!';
    let seconds = Math.floor(miliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    miliseconds = miliseconds % 1000;

    minutes = minutes.toString().padStart(4, '0');
    seconds = seconds.toString().padStart(2, '0');
    miliseconds = miliseconds.toString().padStart(3, '0');
    return `${minutes}:${seconds}.${miliseconds}`;
}

startButton.addEventListener('click', () => {
    document.body.style.backgroundColor = 'white';

    startTime = Date.now();
    cancelLoop = false;
    mainLoop();
});
stopButton.addEventListener('click', () => {
    document.body.style.backgroundColor = 'white';
    cancelLoop = true;
});

function mainLoop() {
    if (cancelLoop) {
        cancelLoop = false;
        return;
    }

    currentTime = Date.now();//new Date(2024, 11, 30, 23, 59, 40).getTime() + (Date.now() - startTime);
    let timeText = new Date(currentTime).toLocaleTimeString();
    let timeDropText = targetPlayTime - currentTime
    let timeStartText = (targetPlayTime - videoDropTime) - currentTime;

    messageParagraph.innerHTML = `
        Current Time: ${timeText}<br>
        Time for drop to start: ${displayTimeLeft(timeDropText)}<br>
        Time for video to start: ${displayTimeLeft(timeStartText)}<br>
    `

    if (currentTime >= targetPlayTime) {
        document.body.style.backgroundColor = 'red';
        return;
    }
    if (currentTime >= (targetPlayTime - videoDropTime)) {
        video.play();
        let currentVideoSecond = video.currentTime
        let actualVideoSecond = (currentTime - (targetPlayTime - videoDropTime)) / 1000
        if (Math.abs(currentVideoSecond - actualVideoSecond) > 0.5) {
            console.info("syncing...")
            video.currentTime = actualVideoSecond;
        }
    } else {
        video.currentTime = 0;
    }
    requestAnimationFrame(mainLoop);
}

valueInput();