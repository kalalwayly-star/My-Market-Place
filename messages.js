import { auth, rtdb, db } from "./firebase-config.js";  // Import Firebase services
import { ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";  // Realtime DB methods
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Firebase Auth methods

const authInstance = getAuth();
onAuthStateChanged(authInstance, (user) => {
    const loginMessage = document.getElementById('loginMessage'); // Message when not logged in
    const messagesContainer = document.getElementById('messagesContainer'); // Where messages are shown

    if (user) {
        // User is logged in
        loginMessage.style.display = 'none';  // Hide the login message
        messagesContainer.style.display = 'block';  // Show messages container
        loadMessages(user.uid);  // Load messages for the logged-in user
    } else {
        // User is not logged in
        loginMessage.style.display = 'block';  // Show login prompt
        messagesContainer.style.display = 'none';  // Hide messages container
    }
});

// Fetch and render messages for the logged-in user
function loadMessages(userId) {
    const messagesRef = ref(rtdb, 'marketplace_messages/' + userId);
    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        const messagesContainer = document.getElementById('messagesContainer');
        if (messages) {
            messagesContainer.innerHTML = "";  // Clear existing messages
            Object.keys(messages).forEach(msgId => {
                const message = messages[msgId];
                renderMessage(message, msgId);
            });
        } else {
            messagesContainer.innerHTML = "<p>No messages found.</p>";
        }
    });
}

// Render a single message
function renderMessage(message, msgId) {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <p>${message.text}</p>
        <small>Sent at ${new Date(message.timestamp).toLocaleString()}</small>
        <button onclick="deleteMessage('${msgId}')">Delete</button>
    `;
    messagesContainer.appendChild(messageElement);
}

// Function to delete a message
window.deleteMessage = function(msgId) {
    if (confirm("Are you sure you want to delete this message?")) {
        const msgRef = ref(rtdb, `marketplace_messages/${msgId}`);
        remove(msgRef).then(() => {
            alert("Message deleted successfully.");
        }).catch(err => {
            console.error("Error deleting message:", err);
            alert("Failed to delete message.");
        });
    }
};

// Sending a message to the seller
window.sendMessage = function(adId, messageText, senderEmail) {
    if (!messageText.trim()) {
        alert("Message cannot be empty.");
        return;
    }

    const messageData = {
        sender: senderEmail,
        receiver: adId.userEmail,  // Assuming adId has userEmail
        text: messageText,
        timestamp: new Date().toISOString()
    };

    const messagesRef = ref(rtdb, `messages/${adId}`);
    push(messagesRef, messageData)
        .then(() => {
            alert("Message sent successfully!");
            loadMessages(adId);  // Reload messages after sending
        })
        .catch(err => {
            console.error("Error sending message:", err);
            alert("Failed to send message.");
        });
};

// Function to switch between tabs (Received/Sent messages)
window.changeTab = function(tab) {
    const tabReceived = document.getElementById('btnReceived');
    const tabSent = document.getElementById('btnSent');
    const currentTab = tab === 'received' ? 'sent' : 'received';

    if (tab === 'received') {
        tabReceived.classList.add('active');
        tabSent.classList.remove('active');
        // Render received messages
    } else {
        tabSent.classList.add('active');
        tabReceived.classList.remove('active');
        // Render sent messages
    }
};

// Initialize messages on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});
