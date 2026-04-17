// HELPER: Get error message element
const getErrorEl = () => document.getElementById('error-message');

/* --- LOGIN FUNCTION --- */
function login() {
    // FIX: Look for 'loginEmail' (new) OR 'email' (old) to avoid breaking things
    const emailEl = document.getElementById('loginEmail') || document.getElementById('email');
    const email = emailEl ? emailEl.value.trim() : "";
    
    const password = document.getElementById('loginPassword').value;
    const errorMsg = getErrorEl();

    if (password.length < 7) {
        errorMsg.innerText = "Error: Password must be at least 7 characters.";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "myads.html"; 
    } else {
        errorMsg.innerText = "Invalid email or password.";
    }
}

/* --- REGISTRATION FUNCTION --- */
function register() {
    const emailEl = document.getElementById('email');
    const email = emailEl ? emailEl.value.trim() : "";
    const password = document.getElementById('loginPassword').value;
    
    // NEW: Capture Security Question & Answer for the Forgot Password flow
    const sQuestion = document.getElementById('securityQuestion');
    const sAnswer = document.getElementById('securityAnswer');
    
    const errorMsg = getErrorEl();

    // Check if these fields exist before trying to use them
    if (!email || !password || (sAnswer && !sAnswer.value.trim())) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 7) {
        errorMsg.innerText = "Account Failed: Password needs 7+ characters.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find(u => u.email === email)) {
        errorMsg.innerText = "Email already registered.";
        return;
    }

    // UPDATED: Save security data + initial stats in one object
    const newUser = { 
        email, 
        password,
        securityQuestion: sQuestion ? sQuestion.value : "pet", // Default to pet if missing
        securityAnswer: sAnswer ? sAnswer.value.trim() : "",
        trustScore: 50,
        flaggedCount: 0,
        posts: 0,
        verified: false
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    sendWelcomeNotification(email);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    
    alert("Account created! Check your messages for a welcome note.");
    window.location.href = "myads.html";
}

/* --- HELPER FUNCTIONS --- */
// (Keep sendWelcomeNotification and checkAdminAccess exactly as they were)
function sendWelcomeNotification(userEmail) {
    const welcomeMsg = {
        id: Date.now(),
        sender: "Marketplace Team",
        receiverEmail: userEmail,
        subject: "Welcome to the Marketplace!",
        body: "Thanks for joining! You can now post ads and feature them to get more views. Enjoy your stay!",
        date: new Date().toLocaleDateString()
    };
    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    messages.push(welcomeMsg);
    localStorage.setItem("messages", JSON.stringify(messages));
}

function checkAdminAccess() {
    const pass = prompt("Enter Admin Password:");
    if (btoa(pass) === "S2FsZWQxOTcwIQ==") { 
        localStorage.setItem('isAdmin', 'true');
        window.location.href = "admin.html";
    } else {
        alert("Access Denied");
    }
}

