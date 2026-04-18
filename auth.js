// HELPER: Get error message element
const getErrorEl = () => document.getElementById('error-message');

/* --- LOGIN FUNCTION --- */
function login() {
    const emailEl = document.getElementById('loginEmail') || document.getElementById('email');
    const email = emailEl ? emailEl.value.trim() : "";
    
    const password = document.getElementById('loginPassword').value;
    const errorMsg = getErrorEl();

    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 7) {
        errorMsg.innerText = "Password must be at least 7 characters.";
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

