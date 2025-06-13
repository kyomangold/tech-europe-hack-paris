# Best-In-Class – AI Tutor

The Best-In-Class AI-powered tutor helps students master any subject using the Feynman technique - learning by teaching. This platform features a Next.js frontend and a Python backend, with integration for real-time, voice-based interactions using LiveKit and Beyond Presence. Students explain concepts in their own words while the AI provides feedback, guidance, and targeted questions to enhance understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search for additional information or retrieve knowledge from provided PDFs (e.g., textbooks, lecture slides, class notes, flashcards, etc.).

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
- AI-powered tutor for interactive learning
- Real-time transcription for accessibility
- Integration with OpenAI for enhanced knowledge retrieval 
- Voice-based interactions with Beyond Presence integration

## Technology Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI
- **Dependencies**:
  - `livekit==1.0.8`
  - `python-dotenv==1.1.0`

## Prerequisites
- Python 3.6 or higher (specific version not found in the codebase)
- Node.js and npm for the frontend
- Access to the OpenAI API, LiveKit API, and Beyond Presence API 

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

3. Create a `.env` file in the root directory:
    ```env
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

4. Run the Beyond Presence avatar backend:
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

## Configuration
No specific configuration files (like `application.properties`, `environment.ts`, etc.) found for further details. Configure sensitive data in the `.env` file as specified above.

## Running the Application
No specific commands for running in production or testing were found. The current development commands are as follows:
- Backend: `python fastapi_backend.py`
- Frontend: `npm run dev`

## API Documentation
Information not found in codebase.

## Project Structure
- Root directory contains backend implementation and requirements.
- Frontend structure is organized under `app/` and `hooks/` for modular components and functionalities.

## Testing
No test files or frameworks found in the project.

## Deployment
No specific deployment instructions such as Docker or Kubernetes configurations found.

## Contributing
Contributors:
- Kyo Mangold (https://github.com/kyomangold)
- Daniel Gisler (https://github.com/gislerda)

## License
Not found in codebase.

---

### Suggestions for Enhancement 
- Provide detailed API documentation.
- Add test cases and testing instructions.
- Include deployment instructions if applicable.
- Define a specific license for the project.