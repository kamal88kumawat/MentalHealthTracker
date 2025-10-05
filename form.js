document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("mentalHealthForm");
  const downloadBtn = document.getElementById("downloadBtn");
  const emailBtn = document.getElementById("emailBtn");
  const messageDiv = document.getElementById("message");

  downloadBtn.style.display = "none";
  emailBtn.style.display = "none";

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const age = document.getElementById("age").value;
    const weight = document.getElementById("weight").value;
    const mood = document.getElementById("mood").value;

    const data = { name, email, age, weight, mood };

    try {
      const response = await fetch("https://mentalhealthtracker-3.onrender.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      messageDiv.innerText = "✅ " + result.message;
      downloadBtn.style.display = "inline-block";
      emailBtn.style.display = "inline-block";
    } catch (error) {
      messageDiv.innerText = "❌ Error submitting form: " + error;
    }
  });

  downloadBtn.addEventListener("click", function () {
    window.location.href = "https://mentalhealthtracker-3.onrender.com/download";
  });

  emailBtn.addEventListener("click", async function () {
    const email = document.getElementById("email").value;
    try {
      const response = await fetch("https://mentalhealthtracker-3.onrender.com/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      messageDiv.innerText = "📧 " + result.message;
    } catch (error) {
      messageDiv.innerText = "❌ Error sending email: " + error;
    }
  });
});
