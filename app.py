# app.py ka updated aur working code
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from fpdf import FPDF
import smtplib
from email.message import EmailMessage
import os
import time

app = Flask(__name__)
CORS(app)

# --------- Email Configuration (from config.env) ----------
from dotenv import load_dotenv
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# --------- Submit Form ----------
@app.route('/submit', methods=['POST'])
def submit_form():
    try:
        data = request.get_json()
        
        # NOTE: Ab hum saare fields receive kar rahe hain
        name = data.get('name', 'N/A')
        email = data.get('email', 'N/A')
        age = data.get('age', 'N/A')
        stress = data.get('stress', '5') # Example: Default to 5
        anxiety = data.get('anxiety', 'N/A')
        sleep = data.get('sleep', 'N/A')
        stress_reasons = ", ".join(data.get('stress_reasons', []))
        
        # Calculate sample score (You should improve this logic!)
        stress_score = 100 - (int(stress) * 10) 
        score = stress_score # Simplistic scoring
        
        # Generate Report
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(200, 10, txt="Mental Health Report", ln=True, align="C")
        pdf.ln(10)
        pdf.set_font("Arial", size=12)
        
        # Adding received data to PDF
        pdf.cell(200, 10, txt=f"Name: {name}", ln=True)
        pdf.cell(200, 10, txt=f"Email: {email}", ln=True)
        pdf.cell(200, 10, txt=f"Stress Level: {stress}/10", ln=True)
        pdf.cell(200, 10, txt=f"Anxiety: {anxiety}", ln=True)
        pdf.cell(200, 10, txt=f"Sleep Quality: {sleep}", ln=True)
        pdf.cell(200, 10, txt=f"Main Stressors: {stress_reasons}", ln=True)
        
        pdf.ln(5)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(200, 10, txt=f"Overall Score: {score}%", ln=True)
        
        status = "Good Mental Health" if score >= 60 else "Needs Attention"
        pdf.cell(200, 10, txt=f"Status: {status}", ln=True)

        # Create a unique file path
        timestamp = int(time.time())
        file_name = f"report_{timestamp}_{name.replace(' ', '_')}.pdf"
        file_path = os.path.join(os.getcwd(), file_name)
        
        pdf.output(file_path)

        # Frontend ko file ka naam bhejo
        return jsonify({"message": "Form submitted successfully!", "score": score, "report": file_name})

    except Exception as e:
        return jsonify({"message": "Server processing failed", "error": str(e)}), 500

# --------- Download Report ----------
@app.route('/download', methods=['GET'])
def download_report():
    file_name = request.args.get('filename') # Frontend se file ka naam liya
    if file_name and os.path.exists(file_name):
        return send_file(file_name, as_attachment=True)
    return jsonify({"message": "Report file not found"}), 404

# --------- Send Report via Email ----------
@app.route('/send_email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        email = data.get('email')
        file_name = data.get('report_file') # Frontend se file ka naam liya
        
        if not file_name or not os.path.exists(file_name):
             return jsonify({"message": "Report not generated or file not found"}), 404

        msg = EmailMessage()
        msg['Subject'] = "Your Mental Health Report"
        msg['From'] = EMAIL_USER
        msg['To'] = email
        msg.set_content("Attached is your Mental Health Report. Take care of your well-being!")

        with open(file_name, "rb") as f:
            msg.add_attachment(f.read(), maintype='application', subtype='pdf', filename=file_name)

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)
            
        return jsonify({"message": f"Report sent successfully to {email}!"})
    except Exception as e:
        # Check EMAIL_USER and EMAIL_PASS if error occurs
        return jsonify({"error": f"Email sending failed: {str(e)}", "message": "Failed to send email"}), 500


if __name__ == "__main__":
    # Tumhara server localhost par chalane ke liye
    app.run(host="0.0.0.0", port=5000, debug=True) # Port 5000 is common for Flask
