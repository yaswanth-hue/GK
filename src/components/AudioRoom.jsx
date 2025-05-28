import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = 'ee03e22442db40789c1a641eae358a68';

// Correct token server endpoint including API path
const TOKEN_SERVER_URL = 'https://retro-h22b3ln6i-yeshwanths-projects-f407cb9b.vercel.app/api/rtcToken';

const AudioRoom = ({ roomName }) => {
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch token from Vercel token server
  const fetchToken = async (channelName) => {
    const response = await fetch(`${TOKEN_SERVER_URL}?channelName=${channelName}`);
    const data = await response.json();
    if (!data.token) throw new Error('Failed to get token');
    return data.token;
  };

  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    return () => leaveChannel();
  }, []);

  const joinChannel = async () => {
    try {
      const token = await fetchToken(roomName);
      const uid = await clientRef.current.join(APP_ID, roomName, token, null);

      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;
      await clientRef.current.publish([localAudioTrack]);

      clientRef.current.on('user-published', async (user, mediaType) => {
        await clientRef.current.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
        setUsers((prev) => [...prev, user]);
      });

      clientRef.current.on('user-unpublished', (user) => {
        setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      setJoined(true);
    } catch (error) {
      console.error('Error joining channel:', error);
      alert('Error joining channel: ' + error.message);
    }
  };

  const leaveChannel = async () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
    }

    await clientRef.current.leave();
    setUsers([]);
    setJoined(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto text-black">
      <h2 className="text-2xl font-bold mb-4">🎙️ Room: {roomName}</h2>

      {!joined ? (
        <button onClick={joinChannel} className="bg-green-500 text-white px-4 py-2 rounded">
          Join Room
        </button>
      ) : (
        <button onClick={leaveChannel} className="bg-red-500 text-white px-4 py-2 rounded">
          Leave Room
        </button>
      )}

      {joined && (
        <div className="mt-4">
          <p>🔊 Users in room: {users.length}</p>
          <ul className="list-disc ml-6">
            {users.map((user) => (
              <li key={user.uid}>User {user.uid}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AudioRoom;
