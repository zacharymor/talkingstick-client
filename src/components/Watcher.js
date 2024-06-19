import React, { useEffect } from 'react';
import io from 'socket.io-client';

const Watcher = () => {
    useEffect(() => {
        let peerConnection;
        const config = {
            iceServers: [
                { "urls": "stun:stun.l.google.com:19302" },
                // {
                //   "urls": "turn:TURN_IP?transport=tcp",
                //   "username": "TURN_USERNAME",
                //   "credential": "TURN_CREDENTIALS"
                // }
            ]
        };

        const socket = io.connect('http://localhost:3000');
        const video = document.querySelector("video");
        const enableAudioButton = document.querySelector("#enable-audio");

        enableAudioButton.addEventListener("click", enableAudio);

        socket.on("offer", (id, description) => {
            peerConnection = new RTCPeerConnection(config);
            peerConnection.setRemoteDescription(description)
                .then(() => peerConnection.createAnswer())
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socket.emit("answer", id, peerConnection.localDescription);
                });
            peerConnection.ontrack = event => {
                video.srcObject = event.streams[0];
            };
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit("candidate", id, event.candidate);
                }
            };
        });

        socket.on("candidate", (id, candidate) => {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error(e));
        });

        socket.on("connect", () => {
            socket.emit("watcher");
        });

        socket.on("broadcaster", () => {
            socket.emit("watcher");
        });

        window.onunload = window.onbeforeunload = () => {
            socket.close();
            peerConnection.close();
        };

        function enableAudio() {
            console.log("Enabling audio");
            video.muted = false;
        }
    }, []);

    return (
        <div>
            <video autoPlay playsInline muted></video>
            <button id="enable-audio">Enable Audio</button>
        </div>
    );
};

export default Watcher;
