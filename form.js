const form = document.getElementById('mentalForm');
const downloadBtn = document.getElementById('downloadBtn');
const emailBtn = document.getElementById('emailBtn');

let pdfFile = "";

form.addEventListener('submit', e=>{
    e.preventDefault();
    const formData = new FormData(form);

    fetch('/submit',{method:'POST', body: formData})
    .then(res=>res.json())
    .then(data=>{
        if(data.status==='success'){
            alert("Report generated!");
            pdfFile = data.pdf_file;
            downloadBtn.disabled = false;
            emailBtn.disabled = false;
        }
    });
});

downloadBtn.addEventListener('click', ()=>{
    window.location.href = pdfFile;
});

emailBtn.addEventListener('click', ()=>{
    const email = form.querySelector('#email').value;
    if(!email){ alert("Enter your email"); return; }

    fetch('/send_email',{
        method:'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: `email=${encodeURIComponent(email)}&pdf_file=${encodeURIComponent(pdfFile)}`
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status==='email_sent'){
            alert("Report sent to your email!");
        }
    });
});
