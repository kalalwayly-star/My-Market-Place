// auth.js

// Function to register a new user
export const registerUser = async (email, password) => {
  try {
    // Simulate user registration by storing user data in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if the user already exists
    const userExists = users.some(user => user.email === email);
    if (userExists) {
      console.error('User already exists');
      alert('User already exists');
      return;
    }

    // Create new user and add it to localStorage
    const newUser = {
      email: email,
      password: password,
      displayName: "", // Default to empty displayName
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    console.log('User registered:', newUser);

    // Store the logged-in user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    // Redirect after successful registration
    window.location.href = "myads.html";
  } catch (error) {
    console.error('Error registering user:', error);
  }
};

// Function to log in a user
export const loginUser = async (email, password) => {
  try {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if the user exists
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
      console.log('User logged in:', user);
      localStorage.setItem("currentUser", JSON.stringify(user)); // Store logged-in user
      window.location.href = "index.html"; // Redirect to the homepage after login
    } else {
      console.error('Invalid credentials');
      alert('Invalid email or password');
    }
  } catch (error) {
    console.error('Error logging in user:', error);
  }
};

// Function to log out the user
export const logoutUser = () => {
  try {
    // Remove the user from localStorage (logout)
    localStorage.removeItem("currentUser");
    console.log('User logged out');
    window.location.href = "login.html"; // Redirect to login page after logout
  } catch (error) {
    console.error('Error signing out user:', error);
  }
};

// Function to reset the password (simulate with localStorage)
export const resetPassword = (email) => {
  try {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(user => user.email === email);
    if (user) {
      alert('Password reset email sent (simulated)');
    } else {
      alert('No user found with this email');
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Function to update user profile (simulated with localStorage)
export const updateUserProfile = (displayName) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      currentUser.displayName = displayName;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      console.log('User profile updated');
    } else {
      alert('No user logged in');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};

/* --- LOGIN FUNCTION --- */
// Login Function (as an event handler)
window.login = function () {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('error-message');

    // Clear previous error message
    errorMsg.innerText = '';

    // Input validation
    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find matching user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // User found, redirect to main page
        localStorage.setItem('loggedInUser', JSON.stringify(user)); // Optionally store logged-in user
        window.location.href = "index.html"; // Redirect after successful login
    } else {
        errorMsg.innerText = "Invalid credentials. Please try again.";
    }
};

/* --- REGISTER FUNCTION --- */
// Register Function (as an event handler)
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

    // Save user to localStorage (this is just a simple example, and it's not encrypted; you should use encryption for real apps)
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const newUser = { email, password }; // Ideally, you would hash the password before saving it
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    // Redirect after successful registration
    window.location.href = "myads.html";
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
