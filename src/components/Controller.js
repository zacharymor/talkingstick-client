import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Controller = ({video}) => {
    const [selectedy, setSelectedy] = useState(false);
    useEffect(() => {
        const socket = io.connect('http://localhost:3000');

        let peerConnection;
        const config = {
            iceServers: [
                { "urls": "stun:stun.l.google.com:19302" },
            ]
        };

        const voteButton = document.querySelector("#vote-button");
        const rotateButton = document.querySelector("#rotate-button");
        const passButton = document.querySelector("#pass-button");
        const takeButton = document.querySelector("#take-button");

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

        function sendVote() {
            console.log("Sending vote");
            socket.emit('vote');
        }

        function rotate() {
            socket.emit('rotate');
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
            <button id="vote-button">VOTE</button>
            <button id="rotate-button">ROTATE</button>
            <button id="pass-button" disabled={(!selectedy)}>PASS</button>
            <button id="take-button" disabled={(!selectedy)}>TAKE</button>
            
        </div>
    );
};

export default Controller;
