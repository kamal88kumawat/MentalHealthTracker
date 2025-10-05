// Frontend logic for Mental Health Tracker form submission
// Calls the Flask backend using JSON and enables download/email actions

(function () {
  const BACKEND_URL = "http://localhost:10000";

  const form = document.getElementById("mentalForm");
  const downloadBtn = document.getElementById("downloadBtn");
  const emailBtn = document.getElementById("emailBtn");

  if (!form) return; // No form on this page

  let pdfUrl = "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value || "";
    const age = document.getElementById("age")?.value || "";
    const email = document.getElementById("email")?.value || "";

    // Minimal payload required by backend; add "mood" to drive scoring
    const payload = { name, age, email, mood: "neutral" };

    try {
      const res = await fetch(`${BACKEND_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Report generated!");
        pdfUrl = `${BACKEND_URL}${data.pdf_url || "/download"}`;
        if (downloadBtn) downloadBtn.disabled = false;
        if (emailBtn) emailBtn.disabled = false;
      } else {
        alert(data.error || "Failed to generate report");
      }
    } catch (err) {
      alert("Network error. Is the backend running on port 10000?");
    }
  });

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (pdfUrl) window.location.href = pdfUrl;
    });
  }

  if (emailBtn) {
    emailBtn.addEventListener("click", async () => {
      const name = document.getElementById("name")?.value || "";
      const age = document.getElementById("age")?.value || "";
      const email = document.getElementById("email")?.value || "";
      if (!email) {
        alert("Enter your email");
        return;
      }

      const payload = { name, age, email, mood: "neutral" };
      try {
        const res = await fetch(`${BACKEND_URL}/send_email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message || "Report sent to your email!");
        } else {
          alert(data.error || "Failed to send email");
        }
      } catch (err) {
        alert("Network error. Is the backend running on port 10000?");
      }
    });
  }
})();
