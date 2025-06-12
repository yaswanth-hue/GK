import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './AudioRoomList.css';

const AudioRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to signaling server
    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['polling', 'websocket'],
      withCredentials: true,
      forceNew: true,
      timeout: 10000,
      path: '/socket.io'
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('room-list', (roomList) => {
      setRooms(roomList);
    });

    setSocket(socket);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const createRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      socket.emit('create-room', newRoomName);
      navigate(`/audio-room/${newRoomName}`);
    }
  };

  const joinRoom = (roomId) => {
    navigate(`/audio-room/${roomId}`);
  };

  return (
    <div className="audio-room-list">
      <h2>Audio Rooms</h2>
      <form onSubmit={createRoom} className="create-room-form">
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Enter room name"
          required
        />
        <button type="submit">Create Room</button>
      </form>

      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <h3>{room.name}</h3>
            <p>{room.participants.length} participants</p>
            <button onClick={() => joinRoom(room.id)}>Join Room</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioRoomList; 