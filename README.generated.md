# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words, and the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from provided PDFs (e.g., textbooks, lecture slides, class notes, flashcards, and more).

![Best-In-Class - AI Tutor Screenshot](./best_in_class_ai_feynman.png)

## Project Structure

### Backend
- `agent.py`: Main LiveKit agent implementation with Beyond Presence
- `fastapi_backend.py`: Main backend implementation to connect everything to the frontend
- `agents_openai.py`: OpenAI agent implementation
- `requirements.txt`: Python dependencies

### Frontend
- Next.js application with TypeScript and Tailwind CSS
- Components:
  - `NoAgentNotification.tsx`: UI for when no agent is available
  - `TranscriptionView.tsx`: Real-time transcription display for improved accessibility
  - `CloseIcon.tsx`: UI component for closing modals
- App Structure:
  - `app/page.tsx`: Main application page
  - `app/layout.tsx`: Root layout component
  - `app/api/`: API routes
  - `hooks/`: Custom React hooks

## Features
- AI-powered tutoring with real-time voice interaction
- Feynman technique-based learning
- Integration with LiveKit and Beyond Presence
- Accessible user interface
- Teacher Mode featuring OpenAI Agents API integration

## Technology Stack
- **Backend**: Python
  - Dependencies: 
    - [livekit==1.0.8](https://pypi.org/project/livekit/)
    - [python-dotenv==1.1.0](https://pypi.org/project/python-dotenv/)
- **Frontend**: Next.js, TypeScript, Tailwind CSS

## Prerequisites
- Python 3.x
- npm (for frontend setup)
- Virtual environment tools (for Python)

## Installation

### Backend Setup
1. Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\\Scripts\\activate
    ```

2. Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    pip install livekit-plugins-bey
    ```

3. Create `.env` file in the root directory:
    ```bash
    # OpenAI API  
    OPENAI_API_KEY=sk-...

    # Livekit API  
    LIVEKIT_URL=...
    LIVEKIT_API_KEY=...
    LIVEKIT_API_SECRET=...

    # Beyond Presence API
    BEY_API_KEY=sk-...
    BEY_AVATAR_ID=...
    ```

4. Run the beyond presence avatar backend:
    ```bash
    python agent.py dev
    ```

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd best-in-class-ai
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Start the FastAPI backend server:
    ```bash
    uvicorn fastapi_backend:app --reload
    ```

## API Documentation
Information not found in codebase

## Testing
Information not found in codebase

## Deployment
Information not found in codebase

## Contributing
Contributors:
- Kyo Mangold (https://github.com/kyomangold)
- Daniel Gisler (https://github.com/gislerda)

## License
Information not found in codebase

---

### Notes for Enhancements
- Adding specific API endpoints and examples could enhance the API documentation section.
- Including testing instructions and frameworks would provide clarity on how to test the application.
- Deployment instructions, if applicable, should be added to aid users wishing to deploy the application in different environments.