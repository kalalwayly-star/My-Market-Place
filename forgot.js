let foundUser = null;

function checkUser() {
    const email = document.getElementById('resetEmail').value.trim();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    foundUser = users.find(u => u.email === email);

    if (!foundUser) {
        alert("No account found with that email.");
        return;
    }

    if (!foundUser.securityQuestion || !foundUser.securityAnswer) {
        alert("This account has no recovery setup.");
        return;
    }

    document.getElementById('emailSection').style.display = 'none';
    document.getElementById('securitySection').style.display = 'block';
    document.getElementById('formSubtitle').innerText = "Answer your security question.";

    const questions = {
        pet: "What was the name of your first pet?",
        city: "What city were you born in?",
        school: "What was the name of your first school?"
    };

    document.getElementById('displayQuestion').innerText =
        questions[foundUser.securityQuestion] || "Security question not found";
}

// STEP 2: Verify the Answer
function verifyAnswer() {
    const userAnswer = document.getElementById('answerInput').value.trim();
    
    if (userAnswer.toLowerCase() === foundUser.securityAnswer.toLowerCase()) {
        document.getElementById('securitySection').style.display = 'none';
        document.getElementById('resetFields').style.display = 'block';
        document.getElementById('formTitle').innerText = "New Password";
        document.getElementById('formSubtitle').innerText = "Secure your account.";
        setupEyeToggles();
    } else {
        alert("Incorrect answer. Please try again.");
    }
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

    let users = JSON.parse(localStorage.getItem("users"));
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





