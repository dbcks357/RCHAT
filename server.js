const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

const users = new Map();


function broadcastMessage(message) {
  io.emit('chat message', message);
}

io.on('connection', (socket) => {
  
  const userCount = io.engine.clientsCount;
  io.emit('user-count', io.engine.clientsCount)
  console.log('a user connected');

  socket.on('chat message', (message) => {
    broadcastMessage(message);
  });

  socket.on('nickname', (nickname) => {
    if (users.has(nickname)) {
      socket.emit('nickname_duplicated', nickname);
    } else {
      const prevNickname = Array.from(users.keys()).find((key) => users.get(key) === socket.id);
      if (prevNickname) {
        users.delete(prevNickname); // 이전 닉네임 삭제
      }
      users.set(nickname, socket.id); // 새 닉네임으로 추가
      socket.emit('nickname_saved', nickname);
      socket.broadcast.emit('join message', nickname);
      io.emit('user-count', users.size);
    }
  });
  

  socket.on('reconnect chat', () => {
    const nickname = Array.from(users.keys()).find((key) => users.get(key) === socket.id);
    if (nickname) {
      socket.emit('nickname_saved', nickname);
      socket.broadcast.emit('join message', nickname);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    const nickname = Array.from(users.keys()).find((key) => users.get(key) === socket.id);
    if (nickname) {
      users.delete(nickname);
    }
  });
});

//포트 설정
server.listen(80, () => {
  console.log('listening on *:80');
}
);
