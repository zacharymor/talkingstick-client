import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Watcher = () => {
    const [selectedy, setSelectedy] = useState(false);

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
        const voteButton = document.querySelector("#vote-button");
        const rotateButton = document.querySelector("#rotate-button");
        const passButton = document.querySelector("#pass-button");
        const takeButton = document.querySelector("#take-button");

        enableAudioButton.addEventListener("click", enableAudio);
        voteButton.addEventListener("click", sendVote);
        rotateButton.addEventListener("click", rotate);
        passButton.addEventListener("click", pass);
        takeButton.addEventListener("click", take);

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


        socket.on("selected", () => {
            console.log('selected brooooooo');
            setSelectedy(true);
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

        function sendVote() {
            console.log("Sending vote");
            socket.emit('vote');
        }

        function rotate() {
            socket.emit('rotate');
        }
        function pass() {
            setSelectedy(false);
            socket.emit('rotate');
        }

        function take() {
            setSelectedy(false);
            socket.emit('selected');
        }
        // Cleanup the event listener on component unmount
        return () => {
            voteButton.removeEventListener("click", sendVote);
            rotateButton.removeEventListener("click", rotate);
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <div>
            <video autoPlay playsInline muted></video>
            <button id="enable-audio">Enable Audio</button>
            <button id="vote-button">VOTE</button>
            <button id="rotate-button">ROTATE</button>
            <button id="pass-button" disabled={(!selectedy)}>PASS</button>
            <button id="take-button" disabled={(!selectedy)}>TAKE</button>
            
        </div>
    );
};

export default Watcher;
