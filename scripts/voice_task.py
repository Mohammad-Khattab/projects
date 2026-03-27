#!/usr/bin/env python3
"""
voice_task.py — Record 5 seconds of audio, transcribe locally with faster-whisper,
                then add the result as a task to the task manager.

Requirements:
    pip install faster-whisper sounddevice scipy numpy

Usage:
    python scripts/voice_task.py

The Next.js dev server must be running:
    npm run dev:fullstack   (from repo root)
"""

import sys
import os
import time
import tempfile
import json
import urllib.request
import urllib.error

SAMPLE_RATE  = 16000
DURATION     = 5          # seconds to record
API_URL      = "http://localhost:3001/api/todos"
MODEL_SIZE   = "base"     # tiny | base | small | medium | large-v3


def record_audio(duration: int, sample_rate: int):
    try:
        import numpy as np
        import sounddevice as sd
    except ImportError:
        print("ERROR: Run:  pip install sounddevice numpy scipy faster-whisper")
        sys.exit(1)

    print("Recording in:", end=" ", flush=True)
    for i in (3, 2, 1):
        print(f"{i}...", end=" ", flush=True)
        time.sleep(1)
    print(f"\n🎙  Listening for {duration} seconds...", flush=True)

    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype="int16",
    )
    sd.wait()
    print("✓  Done recording.", flush=True)
    return audio


def transcribe(audio, sample_rate: int) -> str:
    from scipy.io.wavfile import write as wav_write
    from faster_whisper import WhisperModel

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp_path = f.name

    try:
        wav_write(tmp_path, sample_rate, audio)
        print(f"⏳  Transcribing with Whisper '{MODEL_SIZE}' model...", flush=True)
        model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(tmp_path, beam_size=5)
        text = " ".join(seg.text.strip() for seg in segments).strip()
        return text
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def add_task(title: str) -> dict:
    payload = json.dumps({
        "title": title,
        "priority": "none",
        "category": "Work",
        "dueDate": None,
    }).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def main():
    print("=== Voice Task — Task Manager ===\n")

    audio      = record_audio(DURATION, SAMPLE_RATE)
    transcript = transcribe(audio, SAMPLE_RATE)

    if not transcript:
        print("\n⚠  No speech detected. Try again.")
        sys.exit(1)

    print(f'\n📝  Transcript: "{transcript}"')
    confirm = input("Add this as a task? [Y/n]: ").strip().lower()
    if confirm not in ("", "y", "yes"):
        print("Cancelled.")
        sys.exit(0)

    try:
        result = add_task(transcript)
        print(f"\n✅  Task added!  ID: {result.get('id', '?')}")
        print(f"    Open http://localhost:3001/agents — it will appear within 3 seconds.")
    except urllib.error.URLError as e:
        print(f"\n❌  Could not reach the server: {e}")
        print(f"    Make sure the dev server is running:  npm run dev:fullstack")
        sys.exit(1)


if __name__ == "__main__":
    main()
