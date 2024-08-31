from flask import Flask, request, jsonify, json, render_template
import google.generativeai as genai

app = Flask(__name__)

# Function to load API key from JSON file
def load_api_key():
    with open('config.json', 'r') as f:
        config = json.load(f)
    return config.get('GEMINI_API_KEY')

API_KEY = load_api_key()

# Configure the Generative AI client
genai.configure(api_key=API_KEY)

# Function to generate a response from Gemini Generative AI
def generate_response(prompt):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return response.text

# Route to serve the main chatbot page
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to handle chat requests
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    agent_type = data.get('agent_type')

    # Modify prompt based on agent type
    prompt = f"You are a {agent_type} agent. Answer the following query: {user_message}"
    
    try:
        # Generate response from Gemini
        response = generate_response(prompt)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
