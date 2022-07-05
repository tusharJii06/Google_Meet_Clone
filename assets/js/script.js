const socket = io();
const videoGrid = document.getElementById('video-grid'); //div where our video will be loaded
var myPeer = new Peer();
let count = 0;
let myVideoStream; //the video stram is stored in this variable
const myVideo = document.createElement('video'); //div which contains the video
let currentPeer = null;
myVideo.muted = true;
const peers = {};
const names = {};
const userName = prompt("Please enter your name", "");
document.getElementById('chat-box').style.display = "none";
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
document.getElementById('time').innerText = formatAMPM(new Date) + " | ";
setInterval(setTime, 1000);
function setTime() {
    document.getElementById('time').innerText = formatAMPM(new Date) + " | ";
}

document.getElementById('chat-box-btn').addEventListener('click', function () {
    if (document.getElementById('chat-box').style.display == "none") {  
        const html = '<span class="material-symbols-outlined">chat_bubble</span>'
        document.getElementById('chat-box-btn').innerHTML = html
        document.getElementById('chat-box').style.display = "block"
    } else {
        const html = '<span class="material-symbols-outlined">chat</span>'
        document.getElementById('chat-box-btn').innerHTML = html
        document.getElementById('chat-box').style.display = "none"
    }
})

document.getElementById('close-chat-div').addEventListener('click', function () {
    document.getElementById('chat-box').style.display = "none";
})

document.getElementById('meet_info').addEventListener('click', function () {
    if (document.getElementById('meeting-info-block').style.display == "none") {
        document.getElementById('meeting-info-block').style.display = "block"
    } else {
        document.getElementById('meeting-info-block').style.display = "none"
    }
})

document.getElementById('close-meet-div').addEventListener('click', function () {
    document.getElementsById('meeting-info-block').style.display = "none";
})
document.getElementById('close-meet-div').addEventListener('click', function () {
    document.getElementsById('meeting-info-block').style.display = "none";
})

// document.getElementById('copy-btn').addEventListener('click', function(){
//     document.getElementById('url').navigator.clipboard.writeText(ROOM_ID);
// })
navigator.mediaDevices.getUserMedia({
    video: true, //we want video
    audio: true //we want audio
}).then(stream => {
    myVideoStream = stream; //storing the video stream returned to the myVideoStream variable
    addVideoStream(myVideo, stream, userName); //appended my stream to 'video-grid' div

    myPeer.on('call', call => {
        call.answer(stream);
        console.log('Hello')
        const video = document.createElement('video');
        let html = '<i class="fas fa-microphone"></i>'
        video.innerHTML = html;
        call.on('stream', userVideoStream => {
            console.log('video displayed');
            addVideoStream(video, userVideoStream, userName)
        })
        currentPeer = call;
    })
    socket.on('user-connected', (userId) => {
        setTimeout(connectToNewUser, 1000, userId, userName, stream);
    });

})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, userName);
})

function connectToNewUser(userId, userName, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userName);
    })
    call.on('close', () => {
        video.remove();
    })
    peers[userId] = call
    currentPeer = call;
}

function addVideoStream(video, stream, userName) {
    video.srcObject = stream; //setting the source of my video
    video.addEventListener('loadedmetadata', () => {
        video.play(); //start to play the video once loaded
    });
    let outerDiv = document.createElement('div');
    outerDiv.classList.add('user-video');
    outerDiv.setAttribute('id', 'video-' + count);
    count++;
    video.style.height ="250px"
    video.style.width = "350px"
    outerDiv.appendChild(video);
    let nameDiv = document.createElement('div');
    let pinDiv = document.createElement('div');
    nameDiv.classList.add('user-name');
    nameDiv.innerHTML = userName;
    // outerDiv.appendChild(nameDiv);
    videoGrid.appendChild(outerDiv); //appending to 'video-grid' div
}

function muteUnmuteUser() {
    let enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled == true) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteAudio();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteAudio();
    }
}

function turnUserVideoOnOff() {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    // myVideoStream.getVideoTracks()[0].height = "250px";
    // myVideoStream.getVideoTracks()[0].height = "350px";
    if (enabled == true) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setStopVideo()
    } else {
        setPlayVideo()
        // myVideoStream.getVideoTracks()[0].height = "250px";
        // myVideoStream.getVideoTracks()[0].height = "350px";
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

function setPlayVideo() {
    const html = `<span class="material-symbols-outlined">videocam</span>`
    document.getElementById('video-off').innerHTML = html;
    document.getElementById('video-off').style.backgroundColor = '#434649';
}

function setStopVideo() {
    const html = `<span class="material-symbols-outlined">videocam_off</span>`
    document.getElementById('video-off').innerHTML = html;
    document.getElementById('video-off').style.backgroundColor = 'tomato';
}

function setMuteAudio() {
    const html = `<i class="fas fa-microphone"></i>`
    document.getElementById('mute').innerHTML = html;
    document.getElementById('mute').style.backgroundColor = '#434649';
}

function setUnmuteAudio() {
    const html = `<i class="unmute fas fa-microphone-slash"></i>`
    document.getElementById('mute').innerHTML = html;
    document.getElementById('mute').style.backgroundColor = 'tomato';
}

document.getElementById('video-off').addEventListener('click', turnUserVideoOnOff);
document.getElementById('mute').addEventListener('click', muteUnmuteUser);

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
}


$('form').submit(function (e) {
    e.preventDefault();
    let inputMsg = $('input').val();
    if (inputMsg != '')
        socket.emit('send-message', inputMsg, userName);
    $('input').val('');
})

socket.on('recieve-message', (inputMsg, userName) => {
    inputMsg = urlify(inputMsg);
    $('#messages').append(`<li><b style="font-size:.9rem">${userName}</b>&nbsp;${formatAMPM(new Date)}<br/><br/>${inputMsg}</li>`);
    console.log('From server :: ', inputMsg);
})

const scrollToBottom = () => {
    var d = $('#chats');
    d.scrollTop(d.prop("scrollHeight"));
}
scrollToBottom();


var screenSharing = false
function startScreenShare() {
    if (screenSharing) {
        stopScreenSharing()
    }
    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
        screenStream = stream;
        let videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = () => {
            console.log('Screen sharing stopped!');
            stopScreenSharing()
        }
        if (myPeer) {
            let sender = currentPeer.peerConnection.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            })
            sender.replaceTrack(videoTrack)
            screenSharing = true
        }
    })
}

function stopScreenSharing() {
    if (!screenSharing) return;
    let videoTrack = myVideoStream.getVideoTracks()[0];
    if (myPeer) {
        let sender = currentPeer.peerConnection.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
    }
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    });
    screenSharing = false
}

document.getElementById('screen-share-btn').addEventListener('click', startScreenShare);

var isExpanded = false;
document.addEventListener('click', function (e) {
    let clickedElem = e.target;
    let clickedElemId = e.target.id;
    if (isExpanded == false) {
        console.log(clickedElem);
        if (clickedElem.classList.contains('user-video')) {
            let ele = document.getElementById(clickedElemId);
            //ele.style.height = "80vh";
            // ele.style.width = "70vw";
            ele.firstChild.style.height = "80vh";
            ele.firstChild.style.width = "70vw";
            isExpanded = true;
            let arr = document.getElementsByClassName('user-video');
            for (let i = 0; i < arr.length; i++) {
                let elem = arr[i];
                if (elem.id != clickedElemId) {
                    elem.style.display = "none";
                }
            }
        }

    } else {
        if (clickedElem.classList.contains('user-video')) {
            let ele = document.getElementById(clickedElemId);
            // ele.style.height = '350px';
            // ele.style.width = '500px';
            ele.firstChild.style.height = '250px';
            ele.firstChild.style.width = '350px';
            document.getElementById('video-grid').style.display = "flex";
            isExpanded = false;
            let arr = document.getElementsByClassName('user-video');
            for (let i = 0; i < arr.length; i++) {
                arr[i].style.display = "flex";
            }
        }
    }

})