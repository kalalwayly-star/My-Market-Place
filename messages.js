// This function will be used to load messages for the logged-in user and render them
function loadMessages(userId) {
    const messagesRef = ref(rtdb, 'marketplace_messages/' + userId);
    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        const messagesContainer = document.getElementById('messagesContainer');
        if (messages) {
            messagesContainer.innerHTML = "";  // Clear existing messages
            Object.keys(messages).forEach(msgId => {
                const message = messages[msgId];
                renderMessage(message, msgId);  // Render each message
            });
        } else {
            messagesContainer.innerHTML = "<p>No messages found.</p>";
        }
    });
}

// Function to render a single message in the DOM
function renderMessage(message, msgId) {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <p>${message.text}</p>
        <small>Sent at ${new Date(message.timestamp).toLocaleString()}</small>
        <button onclick="deleteMessage('${msgId}')">Delete</button>
    `;
    messagesContainer.appendChild(messageElement);  // Append message to container
}

// Function to delete a message from Realtime Database
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

// Function to send a message to the seller
window.sendMessage = function(adId, messageText, senderEmail) {
    if (!messageText.trim()) {
        alert("Message cannot be empty.");
        return;
    }

    const messageData = {
        sender: senderEmail,
        receiver: adId.userEmail,  // Assuming adId has the receiver's email
        text: messageText,
        timestamp: new Date().toISOString()  // Get timestamp of the message
    };

    const messagesRef = ref(rtdb, `messages/${adId}`);
    push(messagesRef, messageData)  // Push the message to Firebase Realtime Database
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
        loadMessages(auth.currentUser.uid);
    } else {
        tabSent.classList.add('active');
        tabReceived.classList.remove('active');
        // Render sent messages
        loadSentMessages(auth.currentUser.uid);
    }
};

// Load sent messages for the logged-in user
function loadSentMessages(userId) {
    const messagesRef = ref(rtdb, 'marketplace_messages/sent/' + userId);
    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        const messagesContainer = document.getElementById('messagesContainer');
        if (messages) {
            messagesContainer.innerHTML = "";  // Clear existing messages
            Object.keys(messages).forEach(msgId => {
                const message = messages[msgId];
                renderMessage(message, msgId);  // Render each message
            });
        } else {
            messagesContainer.innerHTML = "<p>No sent messages found.</p>";
        }
    });
}

// Initialize messages on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = auth.currentUser;
    if (user) {
        loadMessages(user.uid);  // Load messages for the logged-in user
    }
});
