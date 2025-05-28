import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AudioRoomsListPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(['instrumentor-room']); // mock initial rooms
  const [newRoomName, setNewRoomName] = useState('');

  const createRoom = () => {
    if (newRoomName.trim() === '') return;
    if (rooms.includes(newRoomName)) {
      alert('Room already exists!');
      return;
    }
    setRooms([...rooms, newRoomName]);
    setNewRoomName('');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">🎧 Audio Rooms</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter new room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={createRoom}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Room
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Available Rooms:</h2>
      {rooms.length === 0 && <p>No rooms available.</p>}
      <ul className="list-disc ml-6">
        {rooms.map((room) => (
          <li key={room}>
            <button
              onClick={() => navigate(`/audio-rooms/${room}`)}
              className="text-blue-700 underline"
            >
              {room}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AudioRoomsListPage;
