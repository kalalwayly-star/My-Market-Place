// storage.js

// 1. Get all ads from memory
function getAllAds() {
    return JSON.parse(localStorage.getItem("marketplace_ads")) || [];
}

// 2. Save a completely new list (used for deleting or updating)
function saveAdsList(adsArray) {
    localStorage.setItem("marketplace_ads", JSON.stringify(adsArray));
}

// 3. Add a single new ad to the existing list
function saveToLocalStorage(adObject) {
    const ads = getAllAds();
    ads.push(adObject);
    saveAdsList(ads);
    console.log("Ad saved successfully!", adObject);
}

// 4. Utility to find a single ad by ID (useful for details.html)
function getAdById(id) {
    const ads = getAllAds();
    return ads.find(ad => ad.id == id);
}

function sendToModerationQueue(ad, fraudData) {
    const queue = JSON.parse(localStorage.getItem("moderationQueue")) || [];

    queue.push({
        ...ad,
        fraudScore: fraudData.score,
        fraudReasons: fraudData.reasons,
        riskLevel: fraudData.riskLevel,
        createdAt: Date.now()
    });

    localStorage.setItem("moderationQueue", JSON.stringify(queue));
}