# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words; the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from a provided PDF (e.g., textbook, lecture slides, notes, and more).

![Best-In-Class - AI Tutor Screenshot](./best_in_class_ai_feynman.png)

## Project Structure

### Backend
- `agent.py`: Main LiveKit agent implementation with Beyond Presence.
- `fastapi_backend.py`: Main backend implementation to connect everything to the frontend.
- `agents_openai.py`: OpenAI agent implementation.
- `requirements.txt`: Python dependencies.

### Frontend
- Next.js application with TypeScript and Tailwind CSS.
- Components:
  - `NoAgentNotification.tsx`: UI for when no agent is available.
  - `TranscriptionView.tsx`: Real-time transcription display for improved accessibility.
  - `CloseIcon.tsx`: UI component for closing modals.
- App Structure:
  - `app/page.tsx`: Main application page.
  - `app/layout.tsx`: Root layout component.
  - `app/api/`: API routes.
  - `hooks/`: Custom React hooks.

## Features
- Real-time voice-based interactions.
- Feedback and targeted questioning from AI.
- Voice-to-text capabilities for accessibility.
- Integration with OpenAI agents for enhanced capabilities in "Teacher Mode".

## Technology Stack
- Frontend: Next.js, TypeScript, Tailwind CSS.
- Backend: Python, FastAPI, LiveKit, OpenAI API.
- Additional libraries: livekit, python-dotenv.

## Prerequisites
- Python 3.x
- Node.js
- NPM

## Installation

### Backend Setup
1. Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2. Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    pip install livekit-plugins-bey
    ```

3. Create `.env` file in the root directory:
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
- Configuration for APIs should be placed in the `.env` file as mentioned above.
- No additional configuration files for Spring Boot or Angular were found.

## Running the Application
To run the application in a development environment, follow the setup procedures for both the backend and frontend.

## API Documentation
Information not found in codebase.

## Project Structure
- The project contains two main directories: an AI tutor backend written in Python and a frontend developed using Next.js.
- Each component directory contains its respective files as detailed above.

## Testing
No testing framework or example test files were found in the codebase.

## Deployment
No specific deployment instructions were found in the codebase.

## Contributing
- Contributors:
  - Kyo Mangold (https://github.com/kyomangold)
  - Daniel Gisler (https://github.com/gislerda)

## License
Not found in codebase. 

### Note:
Consider adding a `LICENSE` file to clarify the project's licensing terms, along with API documentation to enhance usability.