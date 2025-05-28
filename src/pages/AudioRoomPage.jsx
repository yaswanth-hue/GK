import React from 'react';
import { useParams } from 'react-router-dom';
import AudioRoom from '../components/AudioRoom';

const AudioRoomPage = () => {
  const { roomId } = useParams();

  if (!roomId) {
    return <div className="p-6 text-center">Room name is required in URL.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AudioRoom roomName={roomId} />
    </div>
  );
};

export default AudioRoomPage;
