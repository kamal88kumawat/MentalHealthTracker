from flask import Flask, render_template, request, jsonify, send_file
from fpdf import FPDF
import os
import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText

app = Flask(__name__)
REPORTS_FOLDER = 'reports'
os.makedirs(REPORTS_FOLDER, exist_ok=True)

# Home & Form routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/form')
def form():
    return render_template('form.html')

# Submit route
@app.route('/submit', methods=['POST'])
def submit():
    data = request.form.to_dict()
    name = data.get('name','User')
    
    # Save CSV
    df = pd.DataFrame([data])
    csv_file = os.path.join(REPORTS_FOLDER, f"{name}_data.csv")
    df.to_csv(csv_file, index=False)

    # Simple score calculation
    stress = int(data.get('stress',5))
    anxiety = data.get('anxiety','sometimes')
    score = stress
    if anxiety=='rarely': score -=2
    elif anxiety=='sometimes': score +=0
    elif anxiety=='often': score +=2
    elif anxiety=='always': score +=3

    # Generate PDF
    pdf_file = os.path.join(REPORTS_FOLDER, f"{name}_report.pdf")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial",'B',16)
    pdf.cell(0,10,f"Mental Health Report - {name}", ln=True)
    pdf.set_font("Arial",'',12)
    pdf.ln(10)
    for key, val in data.items():
        pdf.cell(0,10,f"{key}: {val}", ln=True)
    pdf.cell(0,10,f"Score: {score}", ln=True)
    pdf.output(pdf_file)

    return jsonify({'status':'success', 'pdf_file': pdf_file})

# Send Email
@app.route('/send_email', methods=['POST'])
def send_email():
    email_to = request.form['email']
    pdf_file = request.form['pdf_file']

    EMAIL_ADDRESS = "your_email@gmail.com"
    EMAIL_PASSWORD = "your_app_password"

    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = email_to
    msg['Subject'] = "Mental Health Report"

    body = "Dear User,\nPlease find attached your mental health report."
    msg.attach(MIMEText(body))

    with open(pdf_file,'rb') as f:
        attach = MIMEApplication(f.read(),_subtype='pdf')
        attach.add_header('Content-Disposition','attachment', filename=os.path.basename(pdf_file))
        msg.attach(attach)

    server = smtplib.SMTP('smtp.gmail.com',587)
    server.starttls()
    server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
    server.send_message(msg)
    server.quit()

    return jsonify({'status':'email_sent'})

if __name__ == '__main__':
    app.run(debug=True)
