const fileInput = document.getElementById('file-input');
const playlistList = document.getElementById('playlist-list');
const audio = document.getElementById('audio');
const trackTitle = document.getElementById('track-title');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const vinylDisc = document.getElementById('vinyl-disc');
const uploadBtn = document.querySelector('.upload-btn');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const progressBar = document.getElementById('progress-bar');

let playlist = [];
let trackDurations = [];
let currentTrack = 0;
let isPlaying = false;

// Modern upload icon
if (uploadBtn) {
	uploadBtn.querySelector('.icon').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="15" width="18" height="6" rx="2" fill="white"/><rect x="7" y="3" width="10" height="10" rx="2" fill="white"/></svg>';
	uploadBtn.onclick = function(e) {
		e.preventDefault();
		fileInput.value = null; // Reset so same file can be re-uploaded
		fileInput.click();
	};
}

fileInput.addEventListener('change', (e) => {
	playlist = Array.from(e.target.files);
	trackDurations = Array(playlist.length).fill(null);
	renderPlaylist();
	if (playlist.length > 0) {
		currentTrack = 0;
		loadTrack(currentTrack);
	}
});

function renderPlaylist() {
	playlistList.innerHTML = '';
	playlist.forEach((file, idx) => {
		const li = document.createElement('li');
		const nameSpan = document.createElement('span');
		nameSpan.textContent = file.name;
		li.appendChild(nameSpan);
		// Track length
		const lengthSpan = document.createElement('span');
		lengthSpan.className = 'track-length';
		if (trackDurations[idx] !== null) {
			lengthSpan.textContent = formatTime(trackDurations[idx]);
		} else {
			lengthSpan.textContent = '--:--';
		}
		li.appendChild(lengthSpan);
		if (idx === currentTrack) li.classList.add('active');
		li.addEventListener('click', () => {
			currentTrack = idx;
			loadTrack(currentTrack);
			playAudio();
		});
		playlistList.appendChild(li);
	});
}

function loadTrack(idx) {
	const file = playlist[idx];
	if (!file) return;
	const url = URL.createObjectURL(file);
	audio.src = url;
	trackTitle.textContent = file.name;
	renderPlaylist();
	audio.onloadedmetadata = function() {
		trackDurations[idx] = audio.duration;
		totalDurationEl.textContent = formatTime(audio.duration);
		progressBar.max = audio.duration;
		renderPlaylist();
	};
	audio.ontimeupdate = function() {
		currentTimeEl.textContent = formatTime(audio.currentTime);
		progressBar.value = audio.currentTime;
	};
}
// Progress bar seeking
if (progressBar) {
	progressBar.addEventListener('input', function() {
		audio.currentTime = progressBar.value;
	});
}
function formatTime(seconds) {
	if (isNaN(seconds) || seconds === Infinity) return '--:--';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function playAudio() {
	if (!audio.src) return;
	audio.play();
	isPlaying = true;
	playBtn.querySelector('.icon').innerHTML = '&#10073;&#10073;'; // Pause icon
	vinylDisc.classList.add('rotate');
}

function pauseAudio() {
	audio.pause();
	isPlaying = false;
	playBtn.querySelector('.icon').innerHTML = '&#9654;'; // Play icon
	vinylDisc.classList.remove('rotate');
}

playBtn.addEventListener('click', () => {
	if (!audio.src) return;
	if (isPlaying) {
		pauseAudio();
	} else {
		playAudio();
	}
});

prevBtn.addEventListener('click', () => {
	if (playlist.length === 0) return;
	currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
	loadTrack(currentTrack);
	playAudio();
});

nextBtn.addEventListener('click', () => {
	if (playlist.length === 0) return;
	currentTrack = (currentTrack + 1) % playlist.length;
	loadTrack(currentTrack);
	playAudio();
});

audio.addEventListener('ended', () => {
	vinylDisc.classList.remove('rotate');
	nextBtn.click();
});
