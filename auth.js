import { auth } from "./firebase-config.js"; /firebasejs/12.12.1/firebase-firestore.js  // For Firebase Authentication
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // Firebase Authentication functions

/* --- LOGIN FUNCTION --- */
window.login = function () {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('error-message');

    // Clear any previous error message
    errorMsg.innerText = '';

    // Validation
    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    // Login with email and password
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "index.html"; // Redirect after successful login
        })
        .catch((error) => {
            console.error("LOGIN ERROR:", error);

            let errorMessage = error.message;

            if (error.code === 'auth/user-not-found') {
                errorMessage = "No user found with this email.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            }

            errorMsg.innerText = errorMessage; // Display a custom error message
        });
};

/* --- REGISTER FUNCTION --- */
window.register = function () {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorMsg = document.getElementById('error-message');

    // Validation
    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 7) {
        errorMsg.innerText = "Password must be at least 7 characters.";
        return;
    }

    // Create user with email and password
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "myads.html"; // Redirect after successful registration
        })
        .catch((error) => {
            errorMsg.innerText = error.message; // Display registration error message
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
