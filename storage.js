// storage.js

// 1. Get all ads from memory
function getAllAds() {
    // We use "marketplace_ads" as your primary key
    let ads = JSON.parse(localStorage.getItem("marketplace_ads")) || [];
    
    // INITIALIZE WITH SAMPLE DATA (if empty)
    if (ads.length === 0) {
        ads = [
            { 
                id: 101, 
                title: "Modern Villa", 
                category: "Real Estate", 
                location: "Dubai", 
                lat: 25.2048, 
                lng: 55.2708, 
                price: "200,000", 
                image: "https://placeholder.com",
                status: "Active"
            },
            { 
                id: 102, 
                title: "Sport Sedan", 
                category: "Cars & Trucks", 
                location: "Riyadh", 
                lat: 24.7136, 
                lng: 46.6753, 
                price: "45,000", 
                image: "https://placeholder.com",
                status: "Active"
            },
            { 
                id: 103, 
                title: "Office Desk", 
                category: "Furniture", 
                location: "Cairo", 
                lat: 30.0444, 
                lng: 31.2357, 
                price: "300", 
                image: "https://placeholder.com",
                status: "Active"
            }
        ];
        localStorage.setItem("marketplace_ads", JSON.stringify(ads));
    }
    return ads;
}

// 2. Save a completely new list
function saveAdsList(adsArray) {
    localStorage.setItem("marketplace_ads", JSON.stringify(adsArray));
}

// 3. Add a single new ad
function saveToLocalStorage(adObject) {
    const ads = getAllAds();
    ads.push(adObject);
    saveAdsList(ads);
}

// 4. Find single ad by ID
function getAdById(id) {
    const ads = getAllAds();
    return ads.find(ad => String(ad.id) === String(id));
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
