// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app-check.js";

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
// Referências HTML
const participantsDiv = document.getElementById('participants');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const settingsBtn = document.getElementById('settings-btn');
const emojiBtn = document.getElementById('emoji-btn');

// Estado do usuário
let user = {
    id: null,
    name: null,
    imageUrl: null
};

// Solicitar informações do usuário
function requestUserInfo() {
    user.id = prompt('Digite seu ID do FootMundo:');
    user.name = prompt('Digite seu nome:');
    user.imageUrl = prompt('Digite o link da sua foto de perfil:');
}

// Adicionar participante
function addParticipant(user) {
    const participantDiv = document.createElement('div');
    participantDiv.classList.add('mb-4');
    participantDiv.innerHTML = `
        <img src="${user.imageUrl}" alt="${user.name}" class="rounded-full w-12 h-12">
        <a href="https://www.footmundo.com/jogador/${user.id}" class="block mt-2">${user.name}</a>
    `;
    participantsDiv.appendChild(participantDiv);
}

// Adicionar mensagem
function addMessage(message) {
    const messageDiv = document.createElement('div');
    const isCurrentUser = message.senderId === user.id;

    messageDiv.classList.add(isCurrentUser ? 'text-right' : 'text-left', 'mb-4');
    messageDiv.innerHTML = `
        <div class="text-xs">${isCurrentUser ? 'Você' : message.senderName} - ${message.timestamp}</div>
        <div class="flex items-center ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}">
            <img src="${message.senderImageUrl}" alt="${message.senderName}" class="rounded-full w-12 h-12">
            <div class="bg-gray-200 p-2 rounded ml-4">${message.content}</div>
        </div>
    `;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Inicializar chat
function initChat() {
    requestUserInfo();
    addParticipant(user);

    // Ouvir novas mensagens
    const messagesRef = ref(database, 'messages');
    onValue(messagesRef, snapshot => {
        const messages = snapshot.val();
        messagesDiv.innerHTML = '';
        for (const messageId in messages) {
            const message = messages[messageId];
            addMessage(message);
        }
    });
}

// Enviar mensagem
sendBtn.addEventListener('click', () => {
    const content = messageInput.value.trim();
    if (content) {
        const newMessageRef = push(ref(database, 'messages'));
        set(newMessageRef, {
            senderId: user.id,
            senderName: user.name,
            senderImageUrl: user.imageUrl,
            content: content,
            timestamp: new Date().toLocaleTimeString()
        });
        messageInput.value = '';
    }
});

// Enviar mensagem ao pressionar Enter
messageInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendBtn.click();
    }
});

// Abrir opções de configuração
settingsBtn.addEventListener('click', () => {
    const newImageUrl = prompt('Digite o link da nova imagem de perfil:');
    if (newImageUrl) {
        user.imageUrl = newImageUrl;
        addParticipant(user); // Atualiza a lista de participantes
    }
});

// Inserir emojis
emojiBtn.addEventListener('click', () => {
    const picker = new EmojiMart.Picker({
        onSelect: emoji => {
            insertEmoji(emoji.native);
            picker.destroy();
        }
    });
    picker.picker.style.position = 'fixed';
    picker.picker.style.bottom = '60px';
    picker.picker.style.right = '20px';
    document.body.appendChild(picker.picker);
});

// Função para inserir um emoji no input da mensagem
function insertEmoji(emoji) {
    const startPosition = messageInput.selectionStart;
    const endPosition = messageInput.selectionEnd;
    const currentValue = messageInput.value;
    messageInput.value = currentValue.slice(0, startPosition) + emoji + currentValue.slice(endPosition);
    messageInput.focus();
    messageInput.selectionEnd = startPosition + emoji.length;
}

// Inicializar o aplicativo
initChat();