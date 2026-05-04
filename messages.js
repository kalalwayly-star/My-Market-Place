// ============================================
// MARKETPLACE MESSAGES SYSTEM (FIREBASE)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (!user) {
            alert("Please log in first.");
            window.location.href = "login.html";
            return;
        }

        // Default tab
        changeTab('received');
    });
});


// ============================================
// LOAD RECEIVED MESSAGES
// ============================================
function loadMessages(userId) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    const messagesRef = ref(rtdb, `marketplace_messages/received/${userId}`);

    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        messagesContainer.innerHTML = "";

        if (!messages) {
            messagesContainer.innerHTML = "<p>No messages found.</p>";
            return;
        }

        Object.keys(messages)
            .sort((a, b) => new Date(messages[b].timestamp) - new Date(messages[a].timestamp))
            .forEach(msgId => {
                renderMessage(messages[msgId], msgId, 'received');
            });
    });
}


// ============================================
// LOAD SENT MESSAGES
// ============================================
function loadSentMessages(userId) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    const messagesRef = ref(rtdb, `marketplace_messages/sent/${userId}`);

    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        messagesContainer.innerHTML = "";

        if (!messages) {
            messagesContainer.innerHTML = "<p>No sent messages found.</p>";
            return;
        }

        Object.keys(messages)
            .sort((a, b) => new Date(messages[b].timestamp) - new Date(messages[a].timestamp))
            .forEach(msgId => {
                renderMessage(messages[msgId], msgId, 'sent');
            });
    });
}


// ============================================
// RENDER MESSAGE
// ============================================
function renderMessage(message, msgId, type) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message-card');

    messageElement.innerHTML = `
        <div class="message-header">
            <strong>${type === 'received' ? 'From' : 'To'}:</strong>
            <span>${type === 'received' ? message.sender : message.receiver}</span>
        </div>

        <div class="message-ad">
            <strong>Ad:</strong> ${message.adTitle || 'Unknown Ad'}
        </div>

        <div class="message-body">
            <p>${message.text}</p>
        </div>

        <div class="message-footer">
            <small>${new Date(message.timestamp).toLocaleString()}</small>
            <button onclick="deleteMessage('${msgId}', '${type}')">
                Delete
            </button>
        </div>
    `;

    messagesContainer.appendChild(messageElement);
}


// ============================================
// DELETE MESSAGE
// ============================================
window.deleteMessage = function(msgId, type) {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm("Are you sure you want to delete this message?")) return;

    const msgRef = ref(
        rtdb,
        `marketplace_messages/${type}/${user.uid}/${msgId}`
    );

    remove(msgRef)
        .then(() => {
            alert("Message deleted successfully.");
        })
        .catch(err => {
            console.error("Delete failed:", err);
            alert("Failed to delete message.");
        });
};


// ============================================
// SEND MESSAGE
// ============================================
window.sendMessage = function(ad, messageText, senderEmail) {
    if (!messageText.trim()) {
        alert("Message cannot be empty.");
        return;
    }

    if (!ad || !ad.userId) {
        alert("Seller information missing.");
        return;
    }

    const senderUser = auth.currentUser;
    if (!senderUser) {
        alert("Please log in first.");
        return;
    }

    const messageData = {
        sender: senderEmail,
        receiver: ad.userEmail || ad.userId,
        adId: ad.id,
        adTitle: ad.title,
        text: messageText,
        timestamp: new Date().toISOString()
    };

    // Push to seller inbox
    const sellerInboxRef = ref(
        rtdb,
        `marketplace_messages/received/${ad.userId}`
    );

    // Push to sender sent folder
    const senderSentRef = ref(
        rtdb,
        `marketplace_messages/sent/${senderUser.uid}`
    );

    Promise.all([
        push(sellerInboxRef, messageData),
        push(senderSentRef, messageData)
    ])
        .then(() => {
            alert("Message sent successfully!");
            document.getElementById("messageText").value = "";
        })
        .catch(err => {
            console.error("Send failed:", err);
            alert("Failed to send message.");
        });
};


// ============================================
// TAB SWITCHING
// ============================================
window.changeTab = function(tab) {
    const user = auth.currentUser;
    if (!user) return;

    const tabReceived = document.getElementById('btnReceived');
    const tabSent = document.getElementById('btnSent');

    if (tab === 'received') {
        tabReceived?.classList.add('active');
        tabSent?.classList.remove('active');
        loadMessages(user.uid);
    } else {
        tabSent?.classList.add('active');
        tabReceived?.classList.remove('active');
        loadSentMessages(user.uid);
    }
};
