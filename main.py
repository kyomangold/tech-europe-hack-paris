# main.py

from audio_io import record_audio, play_audio
from asr import transcribe
from llm import chat_with_gpt
from tts import synthesize_speech

def main():
    # Step 1: Record audio
    audio_file = record_audio(duration=5)  # Change duration as needed

    # Step 2: Transcribe with Whisper
    user_text = transcribe(audio_file)
    print("User said:", user_text)

    # Step 3: Chat with GPT
    reply = chat_with_gpt(user_text)
    print("GPT says:", reply)

    # Step 4: Synthesize reply with TTS
    tts_file = synthesize_speech(reply)

    # Step 5: Play the reply
    play_audio(tts_file)

if __name__ == "__main__":
    main()