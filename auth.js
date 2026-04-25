import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

/* --- LOGIN FUNCTION --- */
window.login = function () {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('error-message');

    // Clear any previous error message
    errorMsg.innerText = '';

    // Input validation
    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    // Attempt to log in with Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "index.html"; // Redirect after successful login
        })
        .catch((error) => {
            console.error("LOGIN ERROR:", error);

            let errorMessage = error.message;

            // Custom error messages for specific Firebase errors
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No user found with this email.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            }

            errorMsg.innerText = errorMessage; // Display the error message to the user
        });
};

/* --- REGISTER FUNCTION --- */
window.register = function () {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorMsg = document.getElementById('error-message');

    // Input validation
    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 7) {
        errorMsg.innerText = "Password must be at least 7 characters.";
        return;
    }

    // Create a new user with email and password using Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "myads.html"; // Redirect after successful registration
        })
        .catch((error) => {
            errorMsg.innerText = error.message; // Display the error message to the user
        });
};

/* --- ADMIN CHECK (UNCHANGED) --- */
window.checkAdminAccess = function () {
    const pass = prompt("Enter Admin Password:");

    if (btoa(pass) === "S2FsZWQxOTcwIQ==") {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = "admin.html";
    } else {
        alert("Access Denied");
    }
};
