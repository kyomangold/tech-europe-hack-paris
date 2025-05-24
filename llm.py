# llm.py
import os
from dotenv import load_dotenv

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


load_dotenv()

def chat_with_gpt(user_text):
    system_prompt = "You are a helpful, conversational AI. Answer naturally and concisely."
    response = client.chat.completions.create(model="gpt-4o",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_text},
    ])
    return response.choices[0].message.content.strip()