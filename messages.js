

function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(messages) {
  localStorage.setItem("messages", JSON.stringify(messages));
}

function sendMessage(adId, text) {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }



  const messages = getMessages();

  messages.push({
    adId,
    text,
    from: user.email,
    time: new Date().toLocaleString()
  });

  saveMessages(messages);

  alert("Message sent!");
}
// 1. Define your function as usual
function toggleReply(messageId) {
    console.log("Replying to message:", messageId);
    
    // Find the reply form by ID (make sure your HTML has an ID like `reply-form-123`)
    const replyForm = document.getElementById(`reply-form-${messageId}`);
    
    if (replyForm) {
        // Toggle visibility
        replyForm.classList.toggle('hidden'); 
    }
}

// 2. CRITICAL STEP: Make it global so the HTML 'onclick' can find it
window.toggleReply = toggleReply;

// This makes the function available to the 'onclick' in your HTML
window.toggleReply = function(id) {
    console.log("Toggle reply for ID:", id);
    
    // Replace 'reply-box-' with whatever ID prefix you use for your reply form
    const replyBox = document.getElementById(`reply-box-${id}`); 
    
    if (replyBox) {
        if (replyBox.style.display === "none" || replyBox.style.display === "") {
            replyBox.style.display = "block";
        } else {
            replyBox.style.display = "none";
        }
    } else {
        console.error("Could not find reply box for ID:", id);
    }
};
