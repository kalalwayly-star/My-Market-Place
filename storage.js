// storage.js

// 1. Get all ads from memory
// storage.js

// 1. Get all ads from memory
function getAllAds() {
    let ads = JSON.parse(localStorage.getItem("marketplace_ads")) || [];
    
    // INITIALIZE WITH SAMPLE DATA (if empty)
    // Adding Lat/Lng so the 75km filter has data to calculate
    if (ads.length === 0) {
        ads = [
            { 
                id: Date.now() + 1, 
                title: "Modern Villa", 
                category: "Real Estate", 
                location: "Dubai", 
                lat: 25.2048, 
                lng: 55.2708, 
                price: "200,000", 
                image: "https://placeholder.com" 
            },
            { 
                id: Date.now() + 2, 
                title: "Sport Sedan", 
                category: "Cars & Trucks", 
                location: "Riyadh", 
                lat: 24.7136, 
                lng: 46.6753, 
                price: "45,000", 
                image: "https://placeholder.com" 
            },
            { 
                id: Date.now() + 3, 
                title: "Office Desk", 
                category: "Furniture", 
                location: "Cairo", 
                lat: 30.0444, 
                lng: 31.2357, 
                price: "300", 
                image: "https://placeholder.com" 
            }
        ];
        localStorage.setItem("marketplace_ads", JSON.stringify(ads));
    }
    return ads;
}

// --- KEEP ALL YOUR OTHER FUNCTIONS (saveAdsList, saveToLocalStorage, etc.) BELOW THIS ---


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

// 4. Utility to find a single ad by ID
function getAdById(id) {
    const ads = getAllAds();
    return ads.find(ad => ad.id == id);
}

// 5. Moderation Logic
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
