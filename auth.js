/* --- LOGIN FUNCTION --- */
import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// HELPER: Get error message element
const getErrorEl = () => document.getElementById('error-message');

window.login = function () {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('error-message');

    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "index.html"; // or myads.html
        })
        .catch((error) => {
            errorMsg.innerText = error.message;
        });
};

/* --- REGISTRATION FUNCTION --- */
function register() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = getErrorEl();

    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 7) {
        errorMsg.innerText = "Password must be 7+ characters.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find(u => u.email === email)) {
        errorMsg.innerText = "Email already registered.";
        return;
    }

    const newUser = {
        email,
        password,
        trustScore: 50,
        flaggedCount: 0,
        posts: 0,
        verified: false
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    sendWelcomeNotification(email);
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Account created successfully!");
    window.location.href = "myads.html";
}

/* --- WELCOME MESSAGE --- */
function sendWelcomeNotification(userEmail) {
    const welcomeMsg = {
        id: Date.now(),
        sender: "Marketplace Team",
        receiverEmail: userEmail,
        subject: "Welcome!",
        body: "Thanks for joining our marketplace!",
        date: new Date().toLocaleDateString()
    };

    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    messages.push(welcomeMsg);
    localStorage.setItem("messages", JSON.stringify(messages));
}

/* --- ADMIN CHECK --- */
function checkAdminAccess() {
    const pass = prompt("Enter Admin Password:");
    if (btoa(pass) === "S2FsZWQxOTcwIQ==") {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = "admin.html";
    } else {
        alert("Access Denied");
    }
}

