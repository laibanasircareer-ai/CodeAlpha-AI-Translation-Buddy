# AI Translation Buddy

AI Translation Buddy is a web-based translation application that combines language translation with AI-powered explanations. It helps users translate text between multiple languages and provides additional AI-generated context to better understand the translation.

## Features

* 🌍 Translate text between multiple languages
* 🔍 Automatic language detection
* 🤖 AI-powered explanation of translated text
* 📋 Copy translated text
* 🎤 Speech-to-text input
* 🔊 Text-to-speech output
* 🕒 Translation history
* 🌙 Dark and Light mode
* 🔄 Automatic translation fallback using MyMemory API when the primary translation service is unavailable

## Technologies Used

* HTML5
* CSS3
* JavaScript (ES6)
* Google Public Translation Endpoint
* MyMemory Translation API (Fallback)
* Groq API (AI Explanation)
* Web Speech API

## Project Structure

```text
AI-Translation-Buddy/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── translator.js
│   ├── speech.js
│   └── ui.js
│
└── README.md
```

## How to Run

1. Clone or download this repository.
2. Open the project folder.
3. Open `translator.js`.
4. Add your own Groq API key:

```javascript
const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
```

5. Open `index.html` in your browser or run the project using Live Server.

## AI Feature

After translating text, users can click the **✨ Explain** button to receive an AI-generated explanation that provides:

* Alternative wording
* Cultural notes

This feature is powered by the Groq API using an open-source large language model.

## APIs Used

### Translation

* Google Public Translation Endpoint
* MyMemory Translation API (Fallback)

### AI

* Groq API

## Screenshots

### Home Screen

<img width="1887" height="983" alt="image" src="https://github.com/user-attachments/assets/991f5701-6291-44d9-ad11-f84a74b6c653" />
<img width="1880" height="982" alt="image" src="https://github.com/user-attachments/assets/2ad7e58d-173e-45b5-aaac-95e4744f94c0" />
<img width="1884" height="983" alt="image" src="https://github.com/user-attachments/assets/50a0e70d-024a-426b-b767-f8bcd189210f" />


### Translation
<img width="735" height="905" alt="image" src="https://github.com/user-attachments/assets/ddb6c040-0ef4-467e-a805-40bc3a98f7d4" />


### AI Explanation
<img width="848" height="633" alt="image" src="https://github.com/user-attachments/assets/055bc126-ed1e-4c87-a875-ab97409adca7" />


## Future Improvements

* User authentication
* Save translations to the cloud
* OCR (Image) translation
* Camera translation
* Conversation mode
* Mobile application
* More detailed AI language explanations

## Author

**Laiba Nasir**

Electrical Engineering Student at Lahore College for Women University

Interested in Artificial Intelligence, Web Development, and Educational Technology.
