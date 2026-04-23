import { auth } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

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
            console.error("LOGIN ERROR:", error); // Log the error for debugging

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
    const email = document.getElementById('registerEmail').value.trim(); // Updated to registerEmail
    const password = document.getElementById('registerPassword').value; // Updated to registerPassword
    const errorMsg = document.getElementById('error-message');

    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 7) {
        errorMsg.innerText = "Password must be at least 7 characters.";
        return;
    }

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

/* --- DEBUG AUTH STATE --- */
onAuthStateChanged(auth, (user) => {
    console.log("AUTH STATE:", user); // Log current user state for debugging
});
