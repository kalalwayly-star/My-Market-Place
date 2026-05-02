// Function to register a new user
export const registerUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some(user => user.email === email)) {
        alert('User already exists');
        return;
    }

    const newUser = { email, password, displayName: "" };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    // Log them in immediately using the unified key
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));
    window.location.href = "myads.html";
};

// Function to log in a user
export const loginUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "index.html";
    } else {
        alert('Invalid email or password');
    }
};

// Global Registration function for the form
window.register = function() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorMsg = document.getElementById('error-message');

    if (!email || !password) {
        if(errorMsg) errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 7) {
        if(errorMsg) errorMsg.innerText = "Password must be at least 7 characters.";
        return;
    }

    registerUser(email, password);
};

// Global Login function for the form
window.login = function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    loginUser(email, password);
};

// Event Listeners for Forms
document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.getElementById('registerForm');
    if (regForm) regForm.addEventListener('submit', (e) => { e.preventDefault(); window.register(); });

    const logForm = document.getElementById('loginForm');
    if (logForm) logForm.addEventListener('submit', (e) => { e.preventDefault(); window.login(); });
});

// Admin check
window.checkAdminAccess = function () {
    const pass = prompt("Enter Admin Password:");
    if (btoa(pass) === "S2FsZWQxOTcwIQ==") {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = "admin.html";
    } else {
        alert("Access Denied");
    }
};
