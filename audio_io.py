# audio_io.py

import sounddevice as sd
from scipy.io.wavfile import write, read
import numpy as np

def record_audio(filename="input.wav", duration=5, fs=16000):
    print(f"Recording {duration}s of audio...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
    sd.wait()
    write(filename, fs, audio)
    print("Recording finished.")
    return filename

def play_audio(filename):
    import simpleaudio as sa
    fs, data = read(filename)
    audio = data.astype(np.int16)
    play_obj = sa.play_buffer(audio, 1, 2, fs)
    play_obj.wait_done()