import { auth } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
/* --- LOGIN FUNCTION --- */
window.login = function () {
    const email = document.getElementById('loginEmail').value.trim();
const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('error-message');

    // Clear previous error message
    errorMsg.innerText = '';

    // Validation
    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    // Sign In
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "index.html"; // Redirect after successful login
        })
       .catch((error) => {
    console.error("LOGIN ERROR:", error); // 👈 ADD THIS

    let errorMessage = error.message; // 👈 CHANGE THIS (show real error)

    if (error.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email.";
    } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
    }

    errorMsg.innerText = errorMessage;
});

/* --- REGISTER FUNCTION (FIREBASE CLEAN VERSION) --- */
window.register = function () {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('loginPassword').value;
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
            window.location.href = "myads.html";
        })
        .catch((error) => {
            errorMsg.innerText = error.message;
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
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    console.log("AUTH STATE:", user); // 👈 helps debugging
});

