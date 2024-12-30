GOOGLE_API_KEY=AIzaSyDHKNUgYsoANwh6a7OpbgEwwOEzsUrhvGU


curl \
  -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY} \
  -H 'Content-Type: application/json' \
  -d @<(echo '{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Why is barbie so popular"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 1,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 8192,
    "responseMimeType": "text/plain"
  }
}')
