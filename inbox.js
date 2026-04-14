const container = document.getElementById("messagesBox");
const user = JSON.parse(localStorage.getItem("currentUser"));

const messages = getMessages();

if (container && user) {
  messages
    .filter(m => m.from === user.email)
    .forEach(m => {
      container.innerHTML += `
        <div class="card">
          <p><strong>Message:</strong> ${m.text}</p>
          <p>Ad ID: ${m.adId}</p>
          <p>${m.time}</p>
        </div>
      `;
    });
}