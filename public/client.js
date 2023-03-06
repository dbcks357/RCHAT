const socket = io();
let lastMessageSentTime = 0;
let messageCount = 0;
let myNickname = '';

const nicknameInput = document.querySelector('#nickname-input');

// 닉네임 입력 시 길이 및 문자열 유효성 검사
nicknameInput.addEventListener('input', (event) => {
  const nickname = event.target.value.trim();

  // 닉네임 길이가 5자 이상이면 경고 메시지 출력 후 닉네임 잘라냄
  if (nickname.length > 5) {
    alert('닉네임은 5자 이하여야 합니다.');
    event.target.value = nickname.slice(0, 5);
    return;
  }

  // 닉네임이 허용되는 문자열로 이루어져 있지 않으면 경고 메시지 출력 후 닉네임 잘라냄
  if (!/^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+$/.test(nickname)) {
    event.target.value = nickname.replace(/[^A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
  }  
});


// 채팅 메시지를 전송하는 함수
function sendMessage() {
  const input = document.getElementById('chat-input');
  const messageText = input ? input.value : '';

  if (messageText) {
    const nicknameElement = document.querySelector('#nickname');
    if (nicknameElement) {
      const message = {
        text: messageText,
        senderId: socket.id,
        isMine: true,
        nickname: nicknameElement.textContent
      };
      socket.emit('chat message', message);
    } else {
      console.log('#nickname element not found');
    }
    input.value = '';
  }
}


socket.on('disconnect', () => {
  console.log('user disconnected');
});

function saveNickname() {
  const nickname = document.getElementById('nickname-input').value;
  socket.emit('nickname', nickname);
}

socket.on('nickname_saved', (nickname) => {
  console.log('received nickname:', nickname);
  //nickname 전역변수에 저장
  myNickname = nickname;
  const nicknameElement = document.querySelector('#nickname');
  if (nicknameElement) {
    nicknameElement.textContent = nickname;
  } else {
    console.log('#nickname element not found');
  }
});


function displayMessage(message) {
  const messages = document.querySelector('.chat-messages');
  const messageItem = document.createElement('div');
  messageItem.classList.add('message');

  // 시간을 나타내는 엘리먼트를 생성합니다.
  const timeElement = document.createElement('div');
  timeElement.classList.add('time');
  timeElement.textContent = new Date().toLocaleTimeString();

  const nicknameElement = document.createElement('div');
  nicknameElement.classList.add('nickname');

  // senderId가 현재 클라이언트의 socket.id와 같으면 내 닉네임을 표시
  if (message.senderId === socket.id) {
    nicknameElement.textContent = myNickname ; // 내 닉네임을 표시
    messageItem.classList.add('mine');
    timeElement.classList.add('mine-time');
    nicknameElement.classList.add('nickname-right'); // 내가 보낸 메시지이므로 오른쪽 정렬
  } else { // 그렇지 않으면 상대방의 닉네임을 표시
    nicknameElement.textContent = message.nickname;
    messageItem.classList.add('theirs');
    timeElement.classList.add('theirs-time');
    nicknameElement.classList.add('nickname-left'); // 상대방이 보낸 메시지이므로 왼쪽 정렬
  }

  const messageText = document.createElement('div');
  messageText.classList.add('message-text');
  messageText.textContent = message.text;
  
  if (message.isSystemMessage) { // 시스템 메시지인 경우
  messageItem.classList.add('system-message');
  }
  
  messageItem.appendChild(nicknameElement);
  messageItem.appendChild(messageText);
  messageItem.appendChild(timeElement);
  
  messages.appendChild(messageItem);
  
  // 스크롤을 맨 아래로 이동시킴
  messages.scrollTo(0, messages.scrollHeight);
}
  
  // 채팅 메시지 수신 이벤트 처리
  socket.on('chat message', (message) => {
  displayMessage(message);
  });
  
  // 채팅 메시지 전송 버튼 클릭 이벤트 처리
  const form = document.getElementById('chat-form');
  form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage();
  });
  
  // 채팅방 재접속
  function reconnectChat() {
  socket.emit('reconnect chat'); // 서버에 재접속 요청
  }

  //입장할 때 안내문구 추가
  socket.on('join message', (nickname) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = `${nickname}님이 입장하셨습니다.`;
    const messagesContainer = document.querySelector('#messages');
    messagesContainer.appendChild(messageElement);
  });

  socket.on('user-count', (count) => {
    const userCountElement = document.querySelector('#user-count');
    userCountElement.textContent = `${count}명`;
  });
