// ===============================
// 🔐 ADMIN ACCESS CHECK
// ===============================
function checkAdminAccess() {
    const isAdmin = localStorage.getItem("isAdmin");

    if (isAdmin !== "true") {
        alert("Access Denied");
        window.location.href = "index.html";  // Redirect if not an admin
    } else {
        // Allow access and load admin resources
        window.location.href = "admin.html";  // Assuming admin page is called admin.html
    }
}

// Run admin check FIRST
checkAdminAccess();


// ===============================
// 🔑 PASSWORD CHECK (ENTRY GATE)
// ===============================
window.onload = function () {
    const pass = prompt("Enter Admin Password:");

    if (pass !== "Kaledadmin1970!") {
        alert("Access Denied");
        window.location.href = "index.html";
        return;
    }

    // Load everything AFTER authentication
    loadModerationQueue();
    loadReports();
};

function adminLogin() {
    const pass = prompt("Enter Admin Password:");
    if (pass !== "Kaledadmin1970!") {
        alert("Access Denied");
        return;
    }

    // Once password is correct, check if the user is an admin
    localStorage.setItem("isAdmin", "true");  // Store isAdmin status
    checkAdminAccess();
}
// ===============================
// 🚨 MODERATION QUEUE (AI FRAUD SYSTEM)
// ===============================
function loadModerationQueue() {
    const container = document.getElementById("moderationList");
    if (!container) return;

    const queue = JSON.parse(localStorage.getItem("moderationQueue")) || [];

    if (queue.length === 0) {
        container.innerHTML = "<p>No ads under review.</p>";
        return;
    }

    container.innerHTML = queue.map(ad => `
        <div class="report-card">

            <h3>${ad.title}</h3>

            <p><strong>Price:</strong> $${ad.price}</p>
            <p><strong>Location:</strong> ${ad.location}</p>

            <!-- 🔴 FRAUD SCORE -->
            <p><strong>Fraud Risk:</strong> 
                <span style="color:${getRiskColor(ad.fraudScore)}">
                    ${ad.fraudScore} (${ad.riskLevel})
                </span>
            </p>

            <!-- 🧠 USER TRUST SCORE -->
            <p><strong>User Trust Score:</strong> 
                <span style="color:${getTrustColor(ad.user?.trustScore)}">
                    ${ad.user?.trustScore ?? "N/A"}
                </span>
            </p>

            <p><strong>Reasons:</strong></p>
            <ul>
                ${ad.fraudReasons.map(r => `<li>${r}</li>`).join("")}
            </ul>

            <button onclick="approveAd(${ad.id})">✅ Approve</button>
            <button onclick="deleteAd(${ad.id})">❌ Delete</button>

        </div>
    `).join("");
}


// ===============================
// ✅ APPROVE AD
// ===============================
function approveAd(adId) {
    let queue = JSON.parse(localStorage.getItem("moderationQueue")) || [];
    let ads = JSON.parse(localStorage.getItem("ads")) || [];

    const ad = queue.find(a => a.id === adId);
    if (!ad) return;

    ads.push(ad);
    queue = queue.filter(a => a.id !== adId);

    localStorage.setItem("ads", JSON.stringify(ads));
    localStorage.setItem("moderationQueue", JSON.stringify(queue));

    alert("Ad approved!");
    loadModerationQueue();
}


// ===============================
// ❌ DELETE AD
// ===============================
function deleteAd(adId) {
    let queue = JSON.parse(localStorage.getItem("moderationQueue")) || [];

    if (!confirm("Delete this ad permanently?")) return;

    queue = queue.filter(a => a.id !== adId);

    localStorage.setItem("moderationQueue", JSON.stringify(queue));

    alert("Ad deleted.");
    loadModerationQueue();
}


// ===============================
// 📋 USER REPORTS (OLD SYSTEM)
// ===============================
function loadReports() {
    const reportList = document.getElementById('reportList');
    if (!reportList) return;

    const allReports = JSON.parse(localStorage.getItem('flaggedAds')) || [];

    if (allReports.length === 0) {
        reportList.innerHTML = "<p>No flagged ads.</p>";
        return;
    }

    reportList.innerHTML = allReports.map((report, index) => `
        <div class="report-card">

            <strong>Ad ID:</strong> ${report.adId} <br>
            <span>Reason: ${report.reason}</span><br>
            <small>${new Date(report.timestamp).toLocaleString()}</small><br><br>

            <button onclick="removeReport(${index})">Remove Report</button>
        </div>
    `).join("");
}


// ===============================
// 🧹 REMOVE REPORT
// ===============================
function removeReport(index) {
    let allReports = JSON.parse(localStorage.getItem('flaggedAds')) || [];

    if (!confirm("Remove this report?")) return;

    allReports.splice(index, 1);
    localStorage.setItem('flaggedAds', JSON.stringify(allReports));

    loadReports();
}


// ===============================
// 🎨 HELPERS
// ===============================
function getRiskColor(score) {
    if (score >= 70) return "red";
    if (score >= 40) return "orange";
    return "green";
}

function getTrustColor(score) {
    if (score >= 70) return "green";
    if (score >= 40) return "orange";
    return "red";
}