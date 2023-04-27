// Configuração do Firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, get } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";



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



function displayMessage(messageId, messageData, isSentByCurrentUser, imageUrl) {
    const messagesContainer = document.querySelector('.messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (isSentByCurrentUser) {
        messageElement.classList.add('sent-message');
    }

    messageElement.innerHTML = `
        <img src="${imageUrl}" alt="${messageData.user}">
        <div class="message-content">
            <div class="message-info">
                ${messageData.user} - ${new Date(messageData.timestamp).toLocaleTimeString()}
            </div>
            ${messageData.text}
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
}




const sendButton = document.querySelector('.send-btn');
const messageInput = document.querySelector('.message-input');

sendButton.addEventListener('click', async () => {
    const messageText = messageInput.value.trim();

    if (messageText) {
        const userName = await getUserName();
        const newMessageRef = push(ref(database, 'messages'));
        const userId = await getUserIP(); // Adicione esta linha
        set(newMessageRef, {
            text: messageText,
            user: userName,
            userId: userId, // Adicione esta linha
            timestamp: Date.now()
        });
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        const messageText = messageInput.value.trim();

        if (messageText) {
            const userName = await getUserName();
            const newMessageRef = push(ref(database, 'messages'));
            const userId = await getUserIP(); // Adicione esta linha
            set(newMessageRef, {
                text: messageText,
                user: userName,
                userId: userId, // Adicione esta linha
                timestamp: Date.now()
            });
            messageInput.value = '';
        }
    }
});





async function loadMessages() {
    const userName = await getUserName();
    onValue(ref(database, 'messages'), async (snapshot) => {
        const messages = snapshot.val();
        const chatWindow = document.querySelector('.messages');
        chatWindow.innerHTML = ''; // Limpa o conteúdo da janela do chat

        for (const messageId in messages) {
            const isSentByCurrentUser = messages[messageId].user === userName;
            const userSnapshot = await get(ref(database, `users/${messages[messageId].userId}`)); // Modifique esta linha
            const user = userSnapshot.val(); // Obtenha o objeto do usuário do banco de dados
            displayMessage(messageId, messages[messageId], isSentByCurrentUser, user.imageUrl); // Passe a URL da imagem do usuário
        }
    });
}






  loadMessages();


  async function getUserIP() {
    const auth = getAuth();
    let user = auth.currentUser;
  
    if (!user) {
      user = await signIn();
    }
  
    return user.uid;
  }
  

  async function getUserName() {
    const auth = getAuth();
    let user = auth.currentUser;
  
    if (!user) {
      user = await signIn();
    }
  
    const storedName = localStorage.getItem(`chatmundo-username-${user.uid}`);
  
    if (storedName) {
      return storedName;
    } else {
      const newName = prompt('Por favor, insira seu nome:');
      const footmundoId = prompt('Por favor, insira seu ID do Footmundo:');
      const profileImageUrl = prompt('Por favor, insira a URL da sua imagem de perfil:');
      if (newName && footmundoId) {
        localStorage.setItem(`chatmundo-username-${user.uid}`, newName);
        localStorage.setItem(`chatmundo-imageUrl-${user.uid}`, profileImageUrl); // Adicione essa linha
        set(ref(database, `users/${user.uid}`), {
          name: newName,
          footmundoId: footmundoId,
          imageUrl: profileImageUrl
        });
        return newName;
      } else {
        alert('Nome e ID do Footmundo são obrigatórios.');
        return getUserName();
      }
    }
  }


  
  

  const settingsBtn = document.querySelector('.settings-btn');
  const modal = document.querySelector('.modal');
  const modalContent = document.querySelector('.modal-content');
  
  settingsBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
  });
  
  modal.addEventListener('click', (event) => {
      if (event.target !== modalContent && !modalContent.contains(event.target)) {
          modal.classList.add('hidden');
      }
  });

  const updateProfileImageForm = document.querySelector('#update-profile-image-form');
  const profileImageUrlInput = document.querySelector('#profile-image-url');
  

  
  

  function renderUser(user, ip) {
    const imageUrl = user.imageUrl ? user.imageUrl : 'https://via.placeholder.com/52';
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <div class="flex items-center mb-2">
            <img src="${imageUrl}" alt="${user.name}" class="rounded-full w-12 h-12 mr-2">
            <a href="https://www.footmundo.com/jogador/${user.footmundoId}" target="_blank" class="font-bold text-blue-500">${user.name}</a>
        </div>
    `;
    listItem.id = ip;
    userList.appendChild(listItem);
}

async function resizeImage(url, width = 52, height = 52) {
    const img = new Image();
    img.src = url;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL();
}

updateProfileImageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const imageUrl = profileImageUrlInput.value.trim();
    if (imageUrl) {
      const resizedImageUrl = await resizeImage(imageUrl);
      const userName = await getUserName();
      const userIP = await getUserIP();
      set(ref(database, `users/${userIP}/imageUrl`), resizedImageUrl);
      modal.classList.add('hidden');
    }
  });
  
  


function toggleModal() {
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

const userList = document.createElement('ul');
const participantsSidebar = document.querySelector('.participants-sidebar');
participantsSidebar.appendChild(userList);

onValue(ref(database, 'users'), (snapshot) => {
    const users = snapshot.val();
    userList.innerHTML = '';

    for (const userIP in users) {
        renderUser(users[userIP], userIP);
    }
});

async function signIn() {
    const auth = getAuth();
    try {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      return null;
    }
  }
  