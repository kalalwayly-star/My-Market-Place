// auth.js

// Import Firebase Auth methods from the Firebase SDK
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

// Import the Firebase configuration (if you haven't already initialized it elsewhere)
import { auth } from './firebase-config.js'; // Import auth from firebase-config.js

// Function to create a new user
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered:', userCredential.user);
  } catch (error) {
    console.error('Error registering user:', error);
  }
};

// Function to sign in a user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user);
  } catch (error) {
    console.error('Error logging in user:', error);
  }
};

// Function to sign out a user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Error signing out user:', error);
  }
};

// Listener to monitor the authentication state (e.g., if user logs in or out)
export const authStateListener = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is logged in:', user);
    } else {
      console.log('No user logged in');
    }
  });
};

// Function to send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Function to update user profile (e.g., display name)
export const updateUserProfile = async (displayName) => {
  try {
    await updateProfile(auth.currentUser, { displayName: displayName });
    console.log('User profile updated');
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};
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
