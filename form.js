from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from fpdf import FPDF
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# -------- Load Environment Variables --------
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# -------- Home Route --------
@app.route('/')
def home():
    return jsonify({"message": "Mental Health Tracker Backend is running!"})

# -------- Submit Form and Generate PDF --------
@app.route('/submit', methods=['POST'])
def submit_form():
    try:
        data = request.get_json()
        name = data.get('name', 'Unknown')
        email = data.get('email', 'Not Provided')
        age = data.get('age', 'N/A')
        weight = data.get('weight', 'N/A')
        mood = data.get('mood', 'neutral')

        # ----- Simple Logic for Score -----
        if mood.lower() in ['sad', 'stressed', 'angry']:
            score = 30
            status = "Needs Attention 🧠"
        elif mood.lower() == 'neutral':
            score = 60
            status = "Average Mental State 🙂"
        else:
            score = 90
            status = "Good Mental Health 😊"

        # ----- Generate PDF -----
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(200, 10, txt="Mental Health Report", ln=True, align="C")
        pdf.ln(10)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Name: {name}", ln=True)
        pdf.cell(200, 10, txt=f"Email: {email}", ln=True)
        pdf.cell(200, 10, txt=f"Age: {age}", ln=True)
        pdf.cell(200, 10, txt=f"Weight: {weight}", ln=True)
        pdf.cell(200, 10, txt=f"Mood: {mood}", ln=True)
        pdf.cell(200, 10, txt=f"Overall Score: {score}%", ln=True)
        pdf.cell(200, 10, txt=f"Status: {status}", ln=True)
        pdf.output("mental_health_report.pdf")

        return jsonify({
            "message": "Form submitted successfully!",
            "score": score,
            "status": status,
            "pdf_url": "/download"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------- Download Report --------
@app.route('/download', methods=['GET'])
def download_report():
    if os.path.exists("mental_health_report.pdf"):
        return send_file("mental_health_report.pdf", as_attachment=True)
    else:
        return jsonify({"error": "No report found"}), 404


# -------- Send Report via Email (UPDATED) --------
@app.route('/send_email', methods=['POST'])
def send_email():
    try:
        # FIX: Now expecting JSON data (like /submit) to regenerate PDF
        data = request.get_json() 
        
        # Saare required fields nikal rahe hain
        email = data.get('email')
        name = data.get('name', 'Unknown')
        age = data.get('age', 'N/A')
        weight = data.get('weight', 'N/A')
        mood = data.get('mood', 'neutral')

        if not email:
            return jsonify({"error": "Email not provided"}), 400

        # ----- Logic for Score (Copied from /submit to ensure PDF generation) -----
        if mood.lower() in ['sad', 'stressed', 'angry']:
            score = 30
            status = "Needs Attention 🧠"
        elif mood.lower() == 'neutral':
            score = 60
            status = "Average Mental State 🙂"
        else:
            score = 90
            status = "Good Mental Health 😊"

        # ----- Generate PDF (Essential step before sending email) -----
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(200, 10, txt="Mental Health Report", ln=True, align="C")
        pdf.ln(10)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Name: {name}", ln=True)
        pdf.cell(200, 10, txt=f"Email: {email}", ln=True)
        pdf.cell(200, 10, txt=f"Age: {age}", ln=True)
        pdf.cell(200, 10, txt=f"Weight: {weight}", ln=True)
        pdf.cell(200, 10, txt=f"Mood: {mood}", ln=True)
        pdf.cell(200, 10, txt=f"Overall Score: {score}%", ln=True)
        pdf.cell(200, 10, txt=f"Status: {status}", ln=True)
        pdf.output("mental_health_report.pdf") # PDF is generated

        # ----- Send Email Logic -----
        msg = EmailMessage()
        msg['Subject'] = "Your Mental Health Report"
        msg['From'] = EMAIL_USER
        msg['To'] = email
        msg.set_content("Attached is your Mental Health Report. Stay positive and take care! 🌿")

        with open("mental_health_report.pdf", "rb") as f:
            msg.add_attachment(f.read(), maintype='application', subtype='pdf', filename="Mental_Health_Report.pdf")

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)

        return jsonify({"message": f"Report sent successfully to {email}!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------- Run App (for Render) --------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
