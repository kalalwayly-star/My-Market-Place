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

    errorMsg.innerText = '';

    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "index.html";
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

            errorMsg.innerText = errorMessage;
        });
};

/* --- REGISTER FUNCTION --- */
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

/* --- ADMIN CHECK --- */
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
    console.log("AUTH STATE:", user);
});
