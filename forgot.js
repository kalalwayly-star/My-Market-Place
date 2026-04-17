let foundUser = null;

// Stage 1: Find User in LocalStorage
function checkUser() {
    const email = document.getElementById('resetEmail').value.trim();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    foundUser = users.find(u => u.email === email);

    if (foundUser) {
        document.getElementById('securitySection').style.display = 'block';
        document.getElementById('emailSection').style.display = 'none';

        const questions = {
            pet: "What was the name of your first pet?",
            city: "What city were you born in?",
            school: "What was the name of your first school?"
        };
        
        document.getElementById('displayQuestion').innerText = questions[foundUser.securityQuestion];
    } else {
        alert("Email not found.");
    }
}

// Stage 2: Verify Security Answer and show Password Reset UI
function verifyAnswer() {
    const answer = document.getElementById('answerInput').value.trim();
    
    if (!foundUser) return;

    if (answer.toLowerCase() === foundUser.securityAnswer.toLowerCase()) {
        // Hide security question and show password reset fields
        document.getElementById('securitySection').style.display = 'none';
        document.getElementById('resetFields').style.display = 'block';
        
        // Initialize eye toggles
        setupEyeToggles();
    } else {
        alert("Wrong answer!");
    }
}

// Stage 3: Eye Toggle Logic for both fields
function setupEyeToggles() {
    const toggles = [
        { btn: '#togglePassword', input: '#newPassword' },
        { btn: '#toggleConfirmPassword', input: '#confirmPassword' }
    ];

    toggles.forEach(item => {
        const icon = document.querySelector(item.btn);
        const field = document.querySelector(item.input);

        if (icon && field) {
            icon.addEventListener('click', function () {
                const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
                field.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
            });
        }
    });
}

// Stage 4: Validate and Update Password automatically
function finalizeReset() {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    // Professional Validations
    if (newPass.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    updatePassword(foundUser.email, newPass);
}

// Stage 5: Save to LocalStorage and Redirect
function updatePassword(email, newPass) {
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    
    users = users.map(u => {
        if (u.email === email) {
            u.password = newPass;
        }
        return u;
    });

    localStorage.setItem("users", JSON.stringify(users));
    alert("Password updated successfully! Redirecting to login...");
    window.location.href = "login.html";
}



