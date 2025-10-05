from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from fpdf import FPDF
import smtplib
from email.message import EmailMessage
import os

app = Flask(__name__)
CORS(app)

# --------- Email Configuration (from config.env) ----------
from dotenv import load_dotenv
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# --------- Home ----------
@app.route('/')
def home():
    return "Mental Health Tracker Backend Running"

# --------- Submit Form ----------
@app.route('/submit', methods=['POST'])
def submit_form():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    age = data.get('age')
    weight = data.get('weight')
    mood = data.get('mood')

    # Calculate sample score
    score = 0
    if mood.lower() in ['sad', 'stressed', 'angry']:
        score = 30
    elif mood.lower() in ['neutral']:
        score = 60
    else:
        score = 90

    # Generate Report
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
    pdf.cell(200, 10, txt="Status: Good Mental Health" if score >= 60 else "Needs Attention", ln=True)

    file_path = "mental_health_report.pdf"
    pdf.output(file_path)

    return jsonify({"message": "Form submitted successfully!", "score": score, "report": file_path})

# --------- Download Report ----------
@app.route('/download', methods=['GET'])
def download_report():
    return send_file("mental_health_report.pdf", as_attachment=True)

# --------- Send Report via Email ----------
@app.route('/send_email', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data.get('email')

    msg = EmailMessage()
    msg['Subject'] = "Your Mental Health Report"
    msg['From'] = EMAIL_USER
    msg['To'] = email
    msg.set_content("Attached is your Mental Health Report. Take care of your well-being!")

    with open("mental_health_report.pdf", "rb") as f:
        msg.add_attachment(f.read(), maintype='application', subtype='pdf', filename="Mental_Health_Report.pdf")

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)
        return jsonify({"message": f"Report sent successfully to {email}!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
