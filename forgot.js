let foundUser = null;

function checkUser() {
    const email = document.getElementById('resetEmail').value.trim();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    foundUser = users.find(u => u.email === email);

    if (!foundUser) {
        alert("No account found with that email.");
        return;
    }

    // ❌ REMOVED SECURITY QUESTION CHECK
    document.getElementById('emailSection').style.display = 'none';
    document.getElementById('resetFields').style.display = 'block';
    document.getElementById('formTitle').innerText = "New Password";
    document.getElementById('formSubtitle').innerText = "Enter your new password.";
}

// STEP 2 (UPDATED): No security answer check anymore
function verifyAnswer() {
    // ❌ This function is no longer needed for verification
    // We directly allow password reset

    document.getElementById('securitySection').style.display = 'none';
    document.getElementById('resetFields').style.display = 'block';
    document.getElementById('formTitle').innerText = "New Password";
    document.getElementById('formSubtitle').innerText = "Secure your account.";
    setupEyeToggles();
}

// STEP 3: Save and Redirect
function finalizeReset() {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (newPass.length < 7) {
        alert("Password must be at least 7 characters.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    users = users.map(u => {
        if (u.email === foundUser.email) {
            u.password = newPass;
        }
        return u;
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Success! Your password has been updated.");
    window.location.href = "login.html";
}

// Helper: Toggle Visibility
function setupEyeToggles() {
    const setup = (iconId, inputId) => {
        const icon = document.getElementById(iconId);
        const input = document.getElementById(inputId);

        icon.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('fa-eye-slash');
        });
    };

    setup('toggleNewPass', 'newPassword');
    setup('toggleConfirmPass', 'confirmPassword');
}





