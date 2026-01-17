// LiveKit Client Application
const { Room, RoomEvent, VideoPresets, Track } = LivekitClient;

let room;
let currentToken;
let videoEnabled = true;
let audioEnabled = true;

// DOM Elements
const preJoinSection = document.getElementById('preJoin');
const roomSection = document.getElementById('room');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const roomNameInput = document.getElementById('roomName');
const userNameInput = document.getElementById('userName');
const currentRoomSpan = document.getElementById('currentRoom');
const videoGrid = document.getElementById('videoGrid');
const participantList = document.getElementById('participantList');
const participantCount = document.getElementById('participantCount');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const shareScreenBtn = document.getElementById('shareScreen');
const statusDiv = document.getElementById('status');

// Event Listeners
joinBtn.addEventListener('click', joinRoom);
leaveBtn.addEventListener('click', leaveRoom);
toggleVideoBtn.addEventListener('click', toggleVideo);
toggleAudioBtn.addEventListener('click', toggleAudio);
shareScreenBtn.addEventListener('click', shareScreen);

async function joinRoom() {
    const roomName = roomNameInput.value.trim();
    const userName = userNameInput.value.trim();

    if (!roomName || !userName) {
        showStatus('Please enter both room name and your name', 'error');
        return;
    }

    try {
        showStatus('Connecting to room...', 'info');

        // Get token from server
        const response = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName, userName })
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        currentToken = data.token;

        // Create room instance
        room = new Room({
            adaptiveStream: true,
            dynacast: true,
            videoCaptureDefaults: {
                resolution: VideoPresets.h720.resolution
            }
        });

        // Set up room event handlers
        setupRoomEvents();

        // Connect to room
        await room.connect(data.url, currentToken);

        // Publish local audio and video
        await room.localParticipant.enableCameraAndMicrophone();

        // Update UI
        preJoinSection.style.display = 'none';
        roomSection.style.display = 'block';
        currentRoomSpan.textContent = roomName;
        showStatus('Connected successfully!', 'success');
        setTimeout(() => statusDiv.className = 'status', 3000);

        // Render local participant
        renderParticipant(room.localParticipant, true);
        updateParticipantList();

    } catch (error) {
        console.error('Error joining room:', error);
        showStatus(`Error: ${error.message}`, 'error');
    }
}

function setupRoomEvents() {
    // Participant connected
    room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('Participant connected:', participant.identity);
        renderParticipant(participant, false);
        updateParticipantList();
        showStatus(`${participant.identity} joined`, 'success');
        setTimeout(() => statusDiv.className = 'status', 3000);
    });

    // Participant disconnected
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('Participant disconnected:', participant.identity);
        removeParticipant(participant.sid);
        updateParticipantList();
        showStatus(`${participant.identity} left`, 'info');
        setTimeout(() => statusDiv.className = 'status', 3000);
    });

    // Track subscribed
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Track subscribed:', track.kind);
        attachTrack(track, participant);
    });

    // Track unsubscribed
    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        console.log('Track unsubscribed:', track.kind);
        detachTrack(track, participant);
    });

    // Disconnected
    room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        cleanup();
    });
}

function renderParticipant(participant, isLocal) {
    const container = document.createElement('div');
    container.className = 'video-container';
    container.id = `participant-${participant.sid}`;

    const label = document.createElement('div');
    label.className = 'video-label';
    label.textContent = isLocal ? `${participant.identity} (You)` : participant.identity;
    container.appendChild(label);

    videoGrid.appendChild(container);

    // Attach existing tracks
    participant.videoTracks.forEach(publication => {
        if (publication.track) {
            attachTrack(publication.track, participant);
        }
    });

    participant.audioTracks.forEach(publication => {
        if (publication.track) {
            attachTrack(publication.track, participant);
        }
    });
}

function attachTrack(track, participant) {
    const container = document.getElementById(`participant-${participant.sid}`);
    if (!container) return;

    const element = track.attach();
    element.style.width = '100%';
    element.style.height = '100%';
    
    if (track.kind === Track.Kind.Video) {
        container.insertBefore(element, container.firstChild);
    } else {
        container.appendChild(element);
    }
}

function detachTrack(track, participant) {
    const elements = track.detach();
    elements.forEach(element => element.remove());
}

function removeParticipant(sid) {
    const container = document.getElementById(`participant-${sid}`);
    if (container) {
        container.remove();
    }
}

function updateParticipantList() {
    if (!room) return;

    const participants = [room.localParticipant, ...Array.from(room.participants.values())];
    participantCount.textContent = participants.length;

    participantList.innerHTML = '';
    participants.forEach(participant => {
        const li = document.createElement('li');
        li.textContent = participant.identity + (participant === room.localParticipant ? ' (You)' : '');
        participantList.appendChild(li);
    });
}

async function toggleVideo() {
    if (!room) return;

    videoEnabled = !videoEnabled;
    await room.localParticipant.setCameraEnabled(videoEnabled);
    toggleVideoBtn.textContent = videoEnabled ? '📹 Video' : '📹 Video (Off)';
    toggleVideoBtn.classList.toggle('disabled');
}

async function toggleAudio() {
    if (!room) return;

    audioEnabled = !audioEnabled;
    await room.localParticipant.setMicrophoneEnabled(audioEnabled);
    toggleAudioBtn.textContent = audioEnabled ? '🎤 Audio' : '🎤 Audio (Off)';
    toggleAudioBtn.classList.toggle('disabled');
}

async function shareScreen() {
    if (!room) return;

    try {
        await room.localParticipant.setScreenShareEnabled(true);
        showStatus('Screen sharing started', 'success');
        setTimeout(() => statusDiv.className = 'status', 3000);
    } catch (error) {
        console.error('Error sharing screen:', error);
        showStatus('Failed to share screen', 'error');
    }
}

async function leaveRoom() {
    if (room) {
        room.disconnect();
    }
    cleanup();
}

function cleanup() {
    videoGrid.innerHTML = '';
    participantList.innerHTML = '';
    participantCount.textContent = '0';
    preJoinSection.style.display = 'block';
    roomSection.style.display = 'none';
    room = null;
}

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    userNameInput.value = `User${Math.floor(Math.random() * 1000)}`;
});
