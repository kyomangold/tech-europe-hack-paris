# tech-europe-hack-paris

# Best-In-Class AI Tutor

An AI Tutor that helps user students learn a subject using the Feynman technique.

## Setup

1. Clone repo.
2. Create `.env`:
    ```
    OPENAI_API_KEY=sk-...
    ```
3. Install requirements:
    ```
    pip install -r requirements.txt
    ```
4. Run the demo:
    ```
    python main.py
    ```

## Files
- `audio_io.py`: record/play audio.
- `asr.py`: Whisper ASR (OpenAI API).
- `llm.py`: GPT-4o LLM chat.
- `tts.py`: OpenAI TTS API.
- `main.py`: orchestration.