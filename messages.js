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

        changeTab('received');
    });
});


// ============================================
// LOAD RECEIVED MESSAGES
// ============================================
function loadMessages(userId) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    const messagesRef = ref(rtdb, `marketplace_messages/received/${userId}`);

    onValue(messagesRef, snapshot => {
        container.innerHTML = "";

        const messages = snapshot.val();

        if (!messages) {
            container.innerHTML = "<p>No messages found.</p>";
            return;
        }

        Object.entries(messages)
            .sort((a, b) =>
                new Date(b[1].timestamp) - new Date(a[1].timestamp)
            )
            .forEach(([msgId, message]) => {
                renderMessage(message, msgId, 'received');
            });
    });
}


// ============================================
// LOAD SENT MESSAGES
// ============================================
function loadSentMessages(userId) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    const messagesRef = ref(rtdb, `marketplace_messages/sent/${userId}`);

    onValue(messagesRef, snapshot => {
        container.innerHTML = "";

        const messages = snapshot.val();

        if (!messages) {
            container.innerHTML = "<p>No sent messages found.</p>";
            return;
        }

        Object.entries(messages)
            .sort((a, b) =>
                new Date(b[1].timestamp) - new Date(a[1].timestamp)
            )
            .forEach(([msgId, message]) => {
                renderMessage(message, msgId, 'sent');
            });
    });
}


// ============================================
// RENDER SINGLE MESSAGE
// ============================================
function renderMessage(message, msgId, type) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    const card = document.createElement('div');
    card.className = "message-card";

    card.innerHTML = `
        <div class="message-header">
            <strong>${type === 'received' ? 'From' : 'To'}:</strong>
            ${type === 'received'
                ? (message.sender || 'Unknown')
                : (message.receiver || 'Unknown')}
        </div>

        <div class="message-ad">
            <strong>Ad:</strong> ${message.adTitle || 'Marketplace Ad'}
        </div>

        <div class="message-body">
            <p>${message.text || ''}</p>
        </div>

        <div class="message-footer">
            <small>${new Date(message.timestamp).toLocaleString()}</small>
            <button class="delete-btn"
                onclick="deleteMessage('${msgId}', '${type}')">
                Delete
            </button>
        </div>
    `;

    container.appendChild(card);
}


// ============================================
// DELETE SINGLE MESSAGE ONLY
// ============================================
window.deleteMessage = function(msgId, type) {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm("Delete this message?")) return;

    const msgRef = ref(
        rtdb,
        `marketplace_messages/${type}/${user.uid}/${msgId}`
    );

    remove(msgRef)
        .then(() => {
            alert("Message deleted successfully.");
        })
        .catch(error => {
            console.error("Delete failed:", error);
            alert("Failed to delete message.");
        });
};


// ============================================
// SEND MESSAGE TO SELLER
// ============================================
window.sendMessage = function(ad, messageText, senderEmail) {
    if (!messageText.trim()) {
        alert("Message cannot be empty.");
        return;
    }

    const senderUser = auth.currentUser;

    if (!senderUser) {
        alert("Please log in first.");
        return;
    }

    if (!ad || !ad.userId) {
        alert("Seller information missing.");
        return;
    }

    const sellerId = ad.userId;

    const messageData = {
        sender: senderEmail,
        receiver: ad.userEmail || ad.userId,
        adId: ad.id || "",
        adTitle: ad.title || "Marketplace Ad",
        text: messageText,
        timestamp: new Date().toISOString()
    };

    const sellerInboxRef = ref(
        rtdb,
        `marketplace_messages/received/${sellerId}`
    );

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

            const msgBox = document.getElementById("messageText");
            if (msgBox) msgBox.value = "";
        })
        .catch(error => {
            console.error("Send failed:", error);
            alert("Failed to send message.");
        });
};


// ============================================
// SWITCH BETWEEN RECEIVED & SENT
// ============================================
window.changeTab = function(tab) {
    const user = auth.currentUser;
    if (!user) return;

    const btnReceived = document.getElementById('btnReceived');
    const btnSent = document.getElementById('btnSent');

    if (tab === 'received') {
        btnReceived?.classList.add('active');
        btnSent?.classList.remove('active');
        loadMessages(user.uid);
    } else {
        btnSent?.classList.add('active');
        btnReceived?.classList.remove('active');
        loadSentMessages(user.uid);
    }
};
