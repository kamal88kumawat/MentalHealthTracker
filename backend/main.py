import requests

def chat_with_ai(prompt):
    url = "http://localhost:11434/api/generate"
    
    data = {
    "model": "phi3",
    "prompt": "You are a friendly mental health assistant. Always reply in English. Be supportive and positive.\nMessage: " + prompt,
    "stream": False
}
    response = requests.post(url, json=data)
    
    result = response.json()
    
    if "response" in result:
        reply = result["response"]
        
        reply = reply.replace("Assistant:", "")
        reply = reply.replace("User:", "")
        reply = reply.replace("Message:", "")
        reply = reply.strip()
        
        return reply
    else:
        return str(result)


        
        