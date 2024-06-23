import React, { useEffect } from 'react';
import io from 'socket.io-client';

const Broadcaster = ({setIsWatcher, setIsBroadcaster}) => {
    useEffect(() => {
        const peerConnections = {};
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

        const disconnect = () => {
            console.log("Disconnecting...");

            // Stop all media tracks
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                    track.stop();
                });
            }

            // Close all peer connections
            if (peerConnections) {
                Object.values(peerConnections).forEach(peerConnection => {
                    peerConnection.close();
                });
            }


            // Notify server to update status
            socket.emit("disconnectPeer", socket.id);

            // Close the socket connection
            socket.close();

            // Update state to switch to watcher
            setIsWatcher(true);
            setIsBroadcaster(false);
        };

        socket.on("answer", (id, description) => {
            peerConnections[id].setRemoteDescription(description);
        });

        socket.on("broadcaster", () => {
            disconnect();
        });

        socket.on("watcher", id => {
            const peerConnection = new RTCPeerConnection(config);
            peerConnections[id] = peerConnection;

            let stream = document.querySelector("video").srcObject;
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit("candidate", id, event.candidate);
                }
            };

            peerConnection.createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socket.emit("offer", id, peerConnection.localDescription);
                });
        });

        socket.on("candidate", (id, candidate) => {
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on("disconnectPeer", id => {
            if (peerConnections.length > 0) {
                peerConnections[id].close();
                delete peerConnections[id];
            }
        });

        window.onunload = window.onbeforeunload = () => {
            socket.close();
        };

        const videoElement = document.querySelector("video");
        const audioSelect = document.querySelector("select#audioSource");
        const videoSelect = document.querySelector("select#videoSource");
        const switchButton = document.querySelector("#switch-button");

        switchButton.addEventListener("click", disconnect);

        audioSelect.onchange = getStream;
        videoSelect.onchange = getStream;

        getStream()
            .then(getDevices)
            .then(gotDevices);

        function getDevices() {
            return navigator.mediaDevices.enumerateDevices();
        }

        function gotDevices(deviceInfos) {
            window.deviceInfos = deviceInfos;
            for (const deviceInfo of deviceInfos) {
                const option = document.createElement("option");
                option.value = deviceInfo.deviceId;
                if (deviceInfo.kind === "audioinput") {
                    option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
                    audioSelect.appendChild(option);
                } else if (deviceInfo.kind === "videoinput") {
                    option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
                    videoSelect.appendChild(option);
                }
            }
        }

        function getStream() {
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            const audioSource = audioSelect.value;
            const videoSource = videoSelect.value;
            const constraints = {
                audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
                video: { deviceId: videoSource ? { exact: videoSource } : undefined }
            };
            return navigator.mediaDevices
                .getUserMedia(constraints)
                .then(gotStream)
                .catch(handleError);
        }

        function gotStream(stream) {
            window.stream = stream;
            audioSelect.selectedIndex = [...audioSelect.options].findIndex(
                option => option.text === stream.getAudioTracks()[0].label
            );
            videoSelect.selectedIndex = [...videoSelect.options].findIndex(
                option => option.text === stream.getVideoTracks()[0].label
            );
            videoElement.srcObject = stream;
            socket.emit("broadcaster");
        }

        function handleError(error) {
            console.error("Error: ", error);
        }



        return () => {
            if (socket) {
                socket.disconnect();
            }
        };

    }, []);

    return (
        <div>
            <video autoPlay muted playsInline></video>
            <div>
                <label htmlFor="audioSource">Audio source: </label><select id="audioSource"></select>
            </div>
            <div>
                <label htmlFor="videoSource">Video source: </label><select id="videoSource"></select>
            </div>
            <button id="switch-button">SWITCH</button>
        </div>
    );
};

export default Broadcaster;
