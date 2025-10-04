// Get chatbot container
const chatbotContainer = document.querySelector('.chatbot-container');

// Create chatbox
const chatbox = document.createElement('div');
chatbox.classList.add('chatbox');
chatbox.innerHTML = `
  <div class="chat-header">Mental Health Chatbot</div>
  <div class="chat-body"></div>
  <div class="chat-input">
    <input type="text" placeholder="Type your message..." />
    <button>Send</button>
  </div>
`;
document.body.appendChild(chatbox);

// Style chatbox dynamically (optional if CSS missing)
const style = document.createElement('style');
style.innerHTML = `
.chatbox {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 300px;
  max-height: 400px;
  background: #f0f8ff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: Arial, sans-serif;
}
.chat-header {
  background: #2563eb;
  color: white;
  padding: 12px;
  font-weight: bold;
  text-align: center;
}
.chat-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}
.chat-input {
  display: flex;
  border-top: 1px solid #ccc;
}
.chat-input input {
  flex: 1;
  padding: 8px;
  border: none;
  outline: none;
}
.chat-input button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}
.chat-input button:hover {
  background: #1d4ed8;
}
.message {
  margin: 6px 0;
  padding: 6px 10px;
  border-radius: 8px;
  max-width: 80%;
  word-wrap: break-word;
}
.user-msg { background: #e6f0ff; align-self: flex-end; }
.bot-msg { background: #cce0ff; align-self: flex-start; }
`;
document.head.appendChild(style);

// Toggle chatbox on click
chatbotContainer.addEventListener('click', () => {
  if (chatbox.style.display === 'none' || chatbox.style.display === '') {
    chatbox.style.display = 'flex';
  } else {
    chatbox.style.display = 'none';
  }
});

// Chat functionality
const inputField = chatbox.querySelector('input');
const sendBtn = chatbox.querySelector('button');
const chatBody = chatbox.querySelector('.chat-body');

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender === 'user' ? 'user-msg' : 'bot-msg');
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Basic AI logic for dynamic reply
function getBotReply(message) {
  message = message.toLowerCase();

  // Keywords mapping
  const responses = [
    { keywords: ['stress', 'tension', 'udaas', 'depressed'], reply: "Samajh sakta hu, kabhi kabhi stress normal hota hai. Kya tum apni feelings share karna chahoge?" },
    { keywords: ['anxious', 'chinta', 'fikar', 'nervous'], reply: "Feeling anxious is common. Try deep breathing or short breaks. Tum batao kya kar raha ho abhi?" },
    { keywords: ['sad', 'udaas', 'lonely', 'akela'], reply: "It’s okay to feel sad. Kabhi kabhi share karna se better feel hota hai. Want to talk more?" },
    { keywords: ['happy', 'khush', 'good', 'excited'], reply: "Wow! Glad to hear you are feeling good 😊. Keep doing what makes you happy!" },
    { keywords: ['sleep', 'so', 'neend'], reply: "Achhi neend lena bahut important hai. Try to sleep 7–8 hours daily." },
    { keywords: ['help', 'professional', 'therapist'], reply: "Seeking help is strong. Agar zarurat ho, trained professional se baat karo." },
    { keywords: ['exercise', 'workout', 'fitness'], reply: "Regular exercise helps mood and stress. Try short daily walks!" },
  ];

  // Match response
  for (let i = 0; i < responses.length; i++) {
    for (let kw of responses[i].keywords) {
      if (message.includes(kw)) {
        return responses[i].reply;
      }
    }
  }

  // Default reply
  return "Hmm, samajh nahi paaya. Tum thoda aur explain karoge? / Can you tell me more?";
}

// Send message
function sendMessage() {
  const userMsg = inputField.value.trim();
  if (!userMsg) return;
  addMessage(userMsg, 'user');
  inputField.value = '';

  // Bot reply after short delay
  setTimeout(() => {
    const botReply = getBotReply(userMsg);
    addMessage(botReply, 'bot');
  }, 600);
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
