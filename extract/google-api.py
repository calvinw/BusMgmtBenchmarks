from openai import OpenAI
from dotenv import load_dotenv
import os


load_dotenv()

client = OpenAI(
    api_key=os.getenv("GOOGLE_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model= "gemini-2.0-flash-exp",
    # model="gemini-1.5-flash",
    n=1,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": "Why is Barbie so popular. Just 50 words"
        }
    ]
)

print(response.choices[0].message.content)
