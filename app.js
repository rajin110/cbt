// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const roomCreation = document.getElementById('room-creation');
const chatSection = document.getElementById('chat-section');
const roomNameInput = document.getElementById('room-name');
const roomPasswordInput = document.getElementById('room-password');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const chatWindow = document.getElementById('chat-window');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const roomTitle = document.getElementById('room-title');

let currentRoomId = null;

// Sign in anonymously (for simplicity)
auth.signInAnonymously().catch((error) => {
  console.error("Error signing in:", error);
});

// Create Room
createRoomButton.addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();
  const roomPassword = roomPasswordInput.value.trim();
  if (roomName && roomPassword) {
    db.collection('rooms').add({
      name: roomName,
      password: roomPassword,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then((docRef) => {
      currentRoomId = docRef.id;
      enterRoom(roomName);
    });
  }
});

// Join Room
joinRoomButton.addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();
  const roomPassword = roomPasswordInput.value.trim();
  if (roomName && roomPassword) {
    db.collection('rooms')
      .where('name', '==', roomName)
      .where('password', '==', roomPassword)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const room = querySnapshot.docs[0];
          currentRoomId = room.id;
          enterRoom(room.data().name);
        } else {
          alert("Invalid room name or password.");
        }
      });
  }
});

// Enter Room
function enterRoom(roomName) {
  roomCreation.classList.add('hidden');
  chatSection.classList.remove('hidden');
  roomTitle.textContent = `Room: ${roomName}`;

  // Load messages
  db.collection('rooms')
    .doc(currentRoomId)
    .collection('messages')
    .orderBy('timestamp')
    .onSnapshot((snapshot) => {
      chatWindow.innerHTML = "";
      snapshot.forEach((doc) => {
        const message = doc.data();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = message.text;
        chatWindow.appendChild(messageElement);
      });
      chatWindow.scrollTop = chatWindow.scrollHeight;
    });
}

// Send Message
sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message && currentRoomId) {
    db.collection('rooms')
      .doc(currentRoomId)
      .collection('messages')
      .add({
        text: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        uid: auth.currentUser.uid
      });
    messageInput.value = "";
  }
});
