from flask import Flask, render_template, request, send_file, jsonify
from fpdf import FPDF
import pandas as pd
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

app = Flask(__name__)
REPORTS_FOLDER = 'reports'
os.makedirs(REPORTS_FOLDER, exist_ok=True)

# Home page
@app.route('/')
def home():
    return render_template('index.html')

# Form page
@app.route('/form')
def form():
    return render_template('form.html')

# Handle form submission
@app.route('/submit', methods=['POST'])
def submit():
    data = request.form.to_dict(flat=False)
    # Save data in CSV
    df = pd.DataFrame(data)
    csv_file = os.path.join(REPORTS_FOLDER, f"{data['name'][0]}_data.csv")
    df.to_csv(csv_file, index=False)

    # Simple Mental Health Score Calculation
    stress = int(data.get('stress', ['5'])[0])
    anxiety = data.get('anxiety', ['sometimes'])[0]
    score = stress
    if anxiety=='rarely': score -= 2
    elif anxiety=='sometimes': score += 0
    elif anxiety=='often': score += 2
    elif anxiety=='always': score += 3

    # Generate PDF report
    pdf_file = os.path.join(REPORTS_FOLDER, f"{data['name'][0]}_report.pdf")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0,10,f"Mental Health Report - {data['name'][0]}", ln=True)
    pdf.ln(10)
    pdf.set_font("Arial", '', 12)
    pdf.cell(0,10,f"Age: {data['age'][0]}", ln=True)
    pdf.cell(0,10,f"Gender: {data['gender'][0]}", ln=True)
    pdf.cell(0,10,f"Stress Level (1-10): {stress}", ln=True)
    pdf.cell(0,10,f"Anxiety: {anxiety}", ln=True)
    pdf.cell(0,10,f"Calculated Mental Health Score: {score}", ln=True)
    pdf.output(pdf_file)

    return jsonify({'status':'success', 'pdf': pdf_file})

# Send report via email
@app.route('/send_email', methods=['POST'])
def send_email():
    email_to = request.form['email']
    pdf_file = request.form['pdf_file']

    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = email_to
    msg['Subject'] = "Your Mental Health Report"

    body = MIMEText("Dear User,\n\nPlease find attached your mental health report.\n\nRegards")
    msg.attach(body)

    with open(pdf_file, 'rb') as f:
        attach = MIMEApplication(f.read(), _subtype='pdf')
        attach.add_header('Content-Disposition','attachment', filename=os.path.basename(pdf_file))
        msg.attach(attach)

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
    server.send_message(msg)
    server.quit()

    return jsonify({'status':'email_sent'})

if __name__ == '__main__':
    app.run(debug=True)
