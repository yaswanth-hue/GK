import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import './AudioRoom.css';

const AudioRoom = ({ roomName }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const roomRef = ref(rtdb, `rooms/${roomName}`);
    
    // Listen for room updates
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParticipants(Object.values(data.participants || {}));
        setIsConnected(true);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [roomName]);

  const leaveRoom = () => {
    navigate('/audio-rooms');
  };

  return (
    <div className="audio-room">
      <div className="room-header">
        <h2>Room: {roomName}</h2>
        <button onClick={leaveRoom} className="leave-button">
          Leave Room
        </button>
      </div>
      
      <div className="participants-list">
        <h3>Participants ({participants.length})</h3>
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>{participant.name}</li>
          ))}
        </ul>
      </div>

      <div className="connection-status">
        Status: {isConnected ? 'Connected' : 'Connecting...'}
      </div>
    </div>
  );
};

export default AudioRoom;
