// Configuração do Firebase
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app-check.js';

// ... código de configuração do Firebase ...
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";


// Initialize Firebase App Check
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LfBARIbAAAAALq6gDw3jxDBq1_AFxHtuYVN_8X_'),
    isTokenAutoRefreshEnabled: true
  });

  
const firebaseConfig = {
    apiKey: "AIzaSyCGAXDQTHMwJn1iy8uwHNL4ateDrGWcFQ8",
    authDomain: "chatmundo-bb72a.firebaseapp.com",
    databaseURL: "https://chatmundo-bb72a-default-rtdb.firebaseio.com",
    projectId: "chatmundo-bb72a",
    storageBucket: "chatmundo-bb72a.appspot.com",
    messagingSenderId: "928887513864",
    appId: "1:928887513864:web:e9cf7d0a2c0ed1cd24c2bd"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Get a reference to the Realtime Database
const database = getDatabase(app);


function sendMessage(messageText, isSentByCurrentUser) {
    const messagesContainer = document.querySelector('.messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (isSentByCurrentUser) {
        messageElement.classList.add('sent-message');
    }

    messageElement.innerHTML = `
        <img src="https://via.placeholder.com/52" alt="User">
        <div class="message-content">
            <div class="message-info">
                ${isSentByCurrentUser ? 'Você' : 'Nome do usuário'} - 00:00
            </div>
            ${messageText}
        </div>
    `;
    

    messagesContainer.appendChild(messageElement);

    const newMessageRef = push(ref(database, 'messages'));
    set(newMessageRef, {
      text: messageText,
      user: isSentByCurrentUser ? 'Você' : 'Nome do usuário',
      timestamp: Date.now()
    });
}

function displayMessage(messageId, messageData) {
    const messageContainer = document.createElement('div');
    const userClass = messageData.user === 'Você' ? 'sent' : 'received';
    messageContainer.classList.add('message', userClass);
  
    const messageText = document.createElement('p');
    messageText.textContent = messageData.text;
    messageContainer.appendChild(messageText);
  
    const messageInfo = document.createElement('small');
    messageInfo.textContent = `${messageData.user} (${new Date(messageData.timestamp).toLocaleTimeString()})`;
    messageContainer.appendChild(messageInfo);
  
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.appendChild(messageContainer);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }


const sendButton = document.querySelector('.send-btn');
const messageInput = document.querySelector('.message-input');

sendButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();

    if (messageText) {
        sendMessage(messageText, true);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const messageText = messageInput.value.trim();

        if (messageText) {
            sendMessage(messageText, true);
            messageInput.value = '';
        }
    }
});

onValue(ref(database, 'messages'), (snapshot) => {
    const messages = snapshot.val();
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.innerHTML = ''; // Limpa o conteúdo da janela do chat
  
    for (const messageId in messages) {
      displayMessage(messageId, messages[messageId]);
    }
  });