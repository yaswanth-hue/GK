import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ExpressPeerServer } from 'peer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8
});

// Create PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs',
  proxied: true
});

app.use('/peerjs', peerServer);

// Store active rooms
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', (roomName) => {
    const roomId = roomName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        name: roomName,
        participants: []
      };
      io.emit('room-list', Object.values(rooms));
    }
  });

  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.join(roomId);
    
    // Add user to room's participants
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        name: roomId,
        participants: []
      };
    }
    
    rooms[roomId].participants.push({
      id: socket.id,
      name: `User ${socket.id.slice(0, 4)}`,
      isMuted: false
    });
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userName: `User ${socket.id.slice(0, 4)}`
    });
    
    // Send current participants list to the new user
    socket.emit('participants-list', rooms[roomId].participants);
    
    // Broadcast updated room list
    io.emit('room-list', Object.values(rooms));
  });

  socket.on('mute-status', ({ roomId, isMuted }) => {
    if (rooms[roomId]) {
      const participant = rooms[roomId].participants.find(p => p.id === socket.id);
      if (participant) {
        participant.isMuted = isMuted;
        // Broadcast mute status to all participants in the room
        io.to(roomId).emit('participants-list', rooms[roomId].participants);
      }
    }
  });

  socket.on('sending-signal', ({ userToSignal, callerID, signal }) => {
    io.to(userToSignal).emit('user-joined', {
      signal,
      callerID
    });
  });

  socket.on('receiving-returned-signal', ({ signal, callerID }) => {
    io.to(callerID).emit('receiving-returned-signal', {
      signal,
      callerID: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
    
    // Remove user from all rooms they were in
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      if (room) {
        const participantIndex = room.participants.findIndex(p => p.id === socket.id);
        if (participantIndex !== -1) {
          room.participants.splice(participantIndex, 1);
          
          // Notify others in the room
          socket.to(roomId).emit('user-left', { userId: socket.id });
          
          // If room is empty, remove it
          if (room.participants.length === 0) {
            delete rooms[roomId];
          }
          
          // Broadcast updated room list
          io.emit('room-list', Object.values(rooms));
        }
      }
    });
  });
});

// API endpoint to get list of active rooms
app.get('/api/rooms', (req, res) => {
  res.json(Object.values(rooms));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 