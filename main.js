/* =========================
   1. CONFIG + SAFE HELPERS
========================= */

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function getAds() {
    return JSON.parse(localStorage.getItem("ads") || "[]");
}

function saveAds(ads) {
    localStorage.setItem("ads", JSON.stringify(ads));
}

/* =========================
   2. NAVIGATION ACTIONS
========================= */

function goToDetails(id) {
    window.location.href = `details.html?id=${id}`;
}

function editAd(id) {
    window.location.href = `post.html?id=${id}`;
}

function deleteAd(id) {
    if (!confirm("Delete this ad?")) return;

    const ads = getAds().filter(ad => ad.id !== id);
    saveAds(ads);

    location.reload();
}

function toggleStatus(id) {
    const ads = getAds();
    const ad = ads.find(a => a.id === id);

    if (!ad) return;

    ad.status = ad.status === "Sold" ? "Active" : "Sold";
    saveAds(ads);

    location.reload();
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

/* =========================
   3. IMAGE HANDLER (FIX FLASH)
========================= */

function getAdImage(ad) {
    if (!ad || !ad.image) return "https://via.placeholder.com/300x200?text=No+Image";

    if (Array.isArray(ad.image) && ad.image.length > 0) {
        return ad.image[0];
    }

    if (typeof ad.image === "string") {
        return ad.image;
    }

    return "https://via.placeholder.com/300x200?text=No+Image";
}

/* =========================
   4. RENDER ADS (STABLE)
========================= */

function renderAds(ads, containerId = "listings") {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!ads || ads.length === 0) {
        container.innerHTML = `<p class="no-ads">No items found.</p>`;
        return;
    }

    const isMyAds = containerId === "myAds";

    container.innerHTML = ads.map(ad => {
        const img = getAdImage(ad);

        return `
        <div class="card"
             onclick="${isMyAds ? "" : `goToDetails(${ad.id})`}"
             style="cursor:pointer; border:1px solid #ddd; border-radius:10px; overflow:hidden; background:#fff; margin-bottom:15px;">

            <div style="height:180px; background:#f5f5f5;">
                <img src="${img}"
                     style="width:100%; height:100%; object-fit:cover;"
                     loading="lazy">
            </div>

            <div style="padding:15px;">
                <h3>${ad.title || "Untitled"}</h3>
                <p><strong>$${ad.price || 0}</strong></p>
                <p>📍 ${ad.location || "Local"}</p>

                ${isMyAds ? `
                    <div style="margin-top:10px; display:flex; gap:8px;">
                        <button onclick="event.stopPropagation(); toggleStatus(${ad.id})">Status</button>
                        <button onclick="event.stopPropagation(); editAd(${ad.id})">Edit</button>
                        <button onclick="event.stopPropagation(); deleteAd(${ad.id})" style="color:red;">Delete</button>
                    </div>
                ` : ""}
            </div>
        </div>
        `;
    }).join("");
}

/* =========================
   5. HEADER
========================= */

function updateHeader() {
    const el = document.getElementById("userAuth");
    if (!el) return;

    if (!currentUser) return;

    el.innerHTML = `
        <span>Hi, ${currentUser.email.split("@")[0]}</span>
        <a href="index.html">Home</a>
        <a href="post.html">Post</a>
        <button onclick="logout()">Logout</button>
    `;
}

/* =========================
   6. INIT (IMPORTANT FIX)
========================= */

function initMain() {
    updateHeader();

    const listings = document.getElementById("listings");
    if (listings) {
        const ads = getAds().filter(a => a.status !== "Sold");
        renderAds(ads, "listings");
    }

    const myAds = document.getElementById("myAds");
    if (myAds) {
        if (!currentUser) {
            myAds.innerHTML = `<p>Please login first.</p>`;
            return;
        }

        const ads = getAds().filter(a => a.userEmail === currentUser.email);
        renderAds(ads, "myAds");
    }
}

/* =========================
   7. SAFE BOOT
========================= */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMain);
} else {
    initMain();
}

