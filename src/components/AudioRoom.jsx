import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { Mic, MicOff, Volume2, VolumeX, Users, Settings, LogOut } from 'lucide-react';
import './AudioRoom.css';

const AudioRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [audioInput, setAudioInput] = useState('');
  const [audioOutput, setAudioOutput] = useState('');
  const socketRef = useRef();
  const peersRef = useRef([]);
  const myPeer = useRef();
  const streamRef = useRef(null);
  const [audioElement, setAudioElement] = useState(null);

  const createAudioFeedback = (stream) => {
    try {
      // Create audio context with better settings
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.5; // 50% volume
      
      // Create compressor for better audio quality
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;
      
      // Create destination
      const destination = audioContext.createMediaStreamDestination();
      
      // Connect nodes: source -> compressor -> gain -> destination
      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(destination);
      
      // Create and configure audio element
      const newAudioElement = new Audio();
      newAudioElement.srcObject = destination.stream;
      newAudioElement.autoplay = true;
      
      // Set audio element properties for better quality
      newAudioElement.mozPreservesPitch = false;
      newAudioElement.preservesPitch = false;
      
      // Store audio context and element
      setAudioElement(newAudioElement);
      
      return { audioContext, source, gainNode, compressor, destination };
    } catch (err) {
      console.error('Error creating audio feedback:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('AudioRoom component mounted');
    console.log('Room ID:', roomId);

    let audioNodes = null;

    try {
      // Initialize PeerJS
      myPeer.current = new Peer(undefined, {
        host: 'localhost',
        port: '3001',
        path: '/peerjs',
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      // Connect to signaling server with proper configuration
      socketRef.current = io('http://localhost:3001', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['polling', 'websocket'],
        withCredentials: true,
        forceNew: true,
        timeout: 10000,
        path: '/socket.io'
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to signaling server');
        // Request microphone access only after connecting to the server
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }, 
          video: false 
        })
          .then(currentStream => {
            console.log('Microphone access granted');
            streamRef.current = currentStream;
            setStream(currentStream);

            // Create audio feedback with better quality
            audioNodes = createAudioFeedback(currentStream);

            // Join room after getting microphone access
            socketRef.current.emit('join-room', roomId);
            console.log('Joined room:', roomId);

            // Handle new user joining
            socketRef.current.on('user-joined', ({ userId, userName }) => {
              console.log('New user joined:', userId);
              connectToNewUser(userId, currentStream);
              setParticipants(prev => [...prev, { id: userId, name: userName, isMuted: false }]);
            });

            // Handle receiving calls
            myPeer.current.on('call', call => {
              call.answer(currentStream);
              call.on('stream', userStream => {
                addPeer(userId, call);
              });
            });

            // Handle user leaving
            socketRef.current.on('user-left', ({ userId }) => {
              console.log('User left:', userId);
              removePeer(userId);
              setParticipants(prev => prev.filter(p => p.id !== userId));
            });

            // Get list of participants
            socketRef.current.on('participants-list', (list) => {
              setParticipants(list);
            });
          })
          .catch(err => {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please ensure you have granted microphone permissions.');
          });
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setError('Failed to connect to audio server. Please try again later.');
      });

    } catch (err) {
      console.error('Error in AudioRoom setup:', err);
      setError('An error occurred while setting up the audio room.');
    }

    return () => {
      console.log('Cleaning up AudioRoom');

      // Clean up audio nodes
      if (audioNodes) {
        audioNodes.source.disconnect();
        audioNodes.gainNode.disconnect();
        audioNodes.compressor.disconnect();
        audioNodes.destination.disconnect();
        audioNodes.audioContext.close();
      }

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped audio track:', track.kind);
        });
      }

      // Stop audio element
      if (audioElement) {
        audioElement.pause();
        audioElement.srcObject = null;
      }

      // Close all peer connections
      peersRef.current.forEach(({ peer }) => {
        peer.close();
        console.log('Closed peer connection');
      });
      peersRef.current = [];

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Disconnected socket');
      }

      // Destroy peer
      if (myPeer.current) {
        myPeer.current.destroy();
        console.log('Destroyed peer');
      }

      // Clear state
      setStream(null);
      setPeers([]);
      setParticipants([]);
      setAudioElement(null);
    };
  }, [roomId, navigate]);

  const connectToNewUser = (userId, stream) => {
    const call = myPeer.current.call(userId, stream);
    call.on('stream', userStream => {
      addPeer(userId, call);
    });
  };

  const addPeer = (userId, call) => {
    peersRef.current.push({
      peerID: userId,
      peer: call
    });
    setPeers(users => [...users, call]);
  };

  const removePeer = (userId) => {
    const peer = peersRef.current.find(p => p.peerID === userId);
    if (peer) {
      peer.peer.close();
      peersRef.current = peersRef.current.filter(p => p.peerID !== userId);
      setPeers(peers => peers.filter(p => p !== peer.peer));
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      if (!isMuted) {
        // Muting: Stop and remove all audio tracks
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          streamRef.current.removeTrack(track);
        });
        setIsMuted(true);
      } else {
        // Unmuting: Get a new audio stream
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }, 
          video: false 
        })
          .then(newStream => {
            streamRef.current = newStream;
            setStream(newStream);
            setIsMuted(false);
            
            // Recreate local audio feedback if not deafened
            if (!isDeafened) {
              createAudioFeedback(newStream);
            }
            
            // Update peer connections with new stream
            peersRef.current.forEach(({ peer }) => {
              const senders = peer.getSenders();
              const audioSender = senders.find(sender => sender.track?.kind === 'audio');
              if (audioSender) {
                audioSender.replaceTrack(newStream.getAudioTracks()[0]);
              }
            });
          })
          .catch(err => {
            console.error('Error getting new audio stream:', err);
            setError('Failed to unmute. Please try again.');
          });
      }

      // Notify other participants about mute status
      if (socketRef.current) {
        socketRef.current.emit('mute-status', {
          roomId,
          isMuted: !isMuted
        });
      }
    }
  };

  const toggleDeafen = () => {
    if (audioElement) {
      if (!isDeafened) {
        // Deafen: Stop audio feedback
        audioElement.pause();
        audioElement.srcObject = null;
      } else {
        // Undeafen: Restore audio feedback if not muted
        if (!isMuted && streamRef.current) {
          createAudioFeedback(streamRef.current);
        }
      }
    }
    setIsDeafened(!isDeafened);
  };

  const leaveRoom = () => {
    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped audio track:', track.kind);
      });
    }

    // Close all peer connections
    peersRef.current.forEach(({ peer }) => {
      peer.close();
      console.log('Closed peer connection');
    });
    peersRef.current = [];

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      console.log('Disconnected socket');
    }

    // Destroy peer
    if (myPeer.current) {
      myPeer.current.destroy();
      console.log('Destroyed peer');
    }

    // Clear state
    setStream(null);
    setPeers([]);
    setParticipants([]);

    // Navigate back to room list
    navigate('/audio-rooms');
  };

  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      return { audioInputs, audioOutputs };
    } catch (err) {
      console.error('Error getting audio devices:', err);
      return { audioInputs: [], audioOutputs: [] };
    }
  };

  if (error) {
    return (
      <div className="audio-room error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={leaveRoom} className="leave-button">
          Return to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="audio-room">
      <div className="room-header">
        <h2>Audio Room: {roomId}</h2>
        <div className="room-controls">
          <button onClick={toggleMute} className={`control-button ${isMuted ? 'active' : ''}`}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button onClick={toggleDeafen} className={`control-button ${isDeafened ? 'active' : ''}`}>
            {isDeafened ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="control-button">
            <Settings size={20} />
          </button>
          <button onClick={leaveRoom} className="control-button leave">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <h3>Audio Settings</h3>
          <div className="settings-content">
            <div className="setting-group">
              <label>Input Device</label>
              <select value={audioInput} onChange={(e) => setAudioInput(e.target.value)}>
                <option value="">Default Microphone</option>
                {/* Add available input devices here */}
              </select>
            </div>
            <div className="setting-group">
              <label>Output Device</label>
              <select value={audioOutput} onChange={(e) => setAudioOutput(e.target.value)}>
                <option value="">Default Speaker</option>
                {/* Add available output devices here */}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="participants-panel">
        <div className="participants-header">
          <Users size={20} />
          <h3>Participants ({participants.length})</h3>
        </div>
        <div className="participants-list">
          {participants.map(participant => (
            <div key={participant.id} className="participant">
              <div className="participant-info">
                <span className="participant-name">{participant.name}</span>
                {participant.id === myPeer.current?.id && <span className="you-badge">You</span>}
              </div>
              <div className="participant-status">
                {participant.isMuted && <MicOff size={16} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioRoom; 