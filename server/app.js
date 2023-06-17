const { Server } = require('socket.io');

const io = new Server(4000, { cors: true });

const emailToSocketIdMap = new Map();
const socketToEmailIdMap = new Map();

io.on('connection', (socket) => {
  const socketId = socket.id;

  socket.on('room:join', (data) => {
    const { email, room } = data;

    socketToEmailIdMap.set(socketId, email);
    emailToSocketIdMap.set(email, socketId);

    io.to(room).emit('user:joined', { email, id: socketId });
    socket.join(room);

    io.to(socketId).emit('room:join', data);
  });

  socket.on('user:call', ({ to, offer }) => {
    io.to(to).emit('incoming:call', { from: socketId, offer });
  });

  socket.on('call:accepted', ({ to, ans }) => {
    io.to(to).emit('call:accepted', { from: socketId, ans });
  });

  socket.on('peer:nego:needed', ({ to, offer }) => {
    io.to(to).emit('peer:nego:needed', { from: socketId, offer });
  });

  socket.on('peer:nego:done', ({ to, ans }) => {
    io.to(to).emit('peer:nego:final', { from: socketId, ans });
  });
});
