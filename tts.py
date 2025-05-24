# tts.py

import openai
import os
from dotenv import load_dotenv

load_dotenv()

def synthesize_speech(text, output_path="output.wav", voice="alloy"):
    response = openai.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text,
        response_format="wav"
    )
    with open(output_path, "wb") as out:
        out.write(response.content)
    return output_path