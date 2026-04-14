// HELPER: Get error message element
const getErrorEl = () => document.getElementById('error-message');

/* --- LOGIN FUNCTION --- */
function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = getErrorEl();

    // 1. Password Length Validation
    if (password.length < 7) {
        errorMsg.innerText = "Error: Password must be at least 7 characters.";
        return;
    }

    // 2. Fetch Users & Authenticate
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
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = getErrorEl();

    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    // 1. Password Length Validation
    if (password.length < 7) {
        errorMsg.innerText = "Account Failed: Password needs 7+ characters.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    // 2. Check if user already exists
    if (users.find(u => u.email === email)) {
        errorMsg.innerText = "Email already registered.";
        return;
    }

    // 3. Save New User
    const newUser = { email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // 4. Send "Welcome Email" (Simulated via Messages)
    // This calls the helper function below
    sendWelcomeNotification(email);

    // 5. Auto-login & Redirect
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    alert("Account created! Check your messages for a welcome note.");
    window.location.href = "myads.html";
}

/* --- HELPER FUNCTION: Simulated Email --- */
function sendWelcomeNotification(userEmail) {
    // This adds a message to the 'messages' storage key
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
    
    console.log("Welcome message sent to: " + userEmail);
}

// This is still not "secure," but it's better than plaintext
function checkAdminAccess() {
    const pass = prompt("Enter Admin Password:");
    // This uses a simple hash check (Base64 for example, though still weak)
    if (btoa(pass) === "S2FsZWQxOTcwIQ==") { 
        localStorage.setItem('isAdmin', 'true');
        window.location.href = "admin.html";
    } else {
        alert("Access Denied");
    }
}

function initUser() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (currentUser && !currentUser.trustScore) {
        // Initialize missing user data (like trustScore)
        currentUser.trustScore = 50;  // Default trust score
        currentUser.flaggedCount = 0; // Initial flagged count
        currentUser.posts = 0;       // Track total posts
        currentUser.verified = false; // Default verified status (could be set later)
        
        // Save updated user back to localStorage
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
}
