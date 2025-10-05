// form.js ka updated aur working code
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('mentalForm');
    const downloadBtn = document.getElementById('downloadBtn');
    const emailBtn = document.getElementById('emailBtn');
    const messageDiv = document.getElementById('message'); // Status message div

    // Initialize button visibility and state
    downloadBtn.style.display = "block";
    emailBtn.style.display = "block";
    downloadBtn.disabled = true;
    emailBtn.disabled = true;

    let pdfFile = ""; // Variable to store PDF path/URL

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // **STEP 1: COLLECT ALL FORM DATA**
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
             // Handle multiple values for checkboxes (if needed)
            if (key === 'stress_reasons') {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });

        // **STEP 2: SEND DATA TO BACKEND (app.py)**
        try {
            messageDiv.innerText = "⏳ Generating report...";
            const response = await fetch("https://mentalhealthtracker-3eip.onrender.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data), // Sending all form data as JSON
            });

            const result = await response.json();
            
            // Check for success status from backend
            if (response.ok && result.report) {
                messageDiv.innerText = "✅ Report generated successfully! Score: " + result.score;
                pdfFile = result.report; // Store the report path from backend
                downloadBtn.disabled = false;
                emailBtn.disabled = false;
            } else {
                messageDiv.innerText = "❌ Error from server: " + (result.message || "Failed to process.");
            }
        } catch (error) {
            // Check if the backend URL is correct and server is running!
            messageDiv.innerText = "❌ Network Error! Is the backend server running?";
            console.error("Fetch error:", error);
        }
    });

    // **STEP 3: DOWNLOAD BUTTON**
    downloadBtn.addEventListener("click", function () {
        if(pdfFile) {
            // Redirect to the download endpoint with the file name
            window.location.href = "https://mentalhealthtracker-3eip.onrender.com/download?filename=" + pdfFile;
        } else {
            alert("Please submit the form first to generate the report.");
        }
    });

    // **STEP 4: SEND EMAIL BUTTON**
    emailBtn.addEventListener("click", async function () {
        const email = document.getElementById("email").value;
        if (!email) { alert("Please enter your email in the form!"); return; }

        try {
            messageDiv.innerText = "📧 Sending email...";
            const response = await fetch("https://mentalhealthtracker-3eip.onrender.com/send_email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Need to send both email and the generated report filename
                body: JSON.stringify({ email: email, report_file: pdfFile }), 
            });
            const result = await response.json();
            
            if (response.ok) {
                messageDiv.innerText = "📧 " + result.message;
            } else {
                 messageDiv.innerText = "❌ Error sending email: " + (result.error || "Server issue.");
            }
        } catch (error) {
            messageDiv.innerText = "❌ Network Error while sending email!";
        }
    });
});
