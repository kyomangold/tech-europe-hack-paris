# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words. The AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from a provided PDF (e.g., textbooks, lecture slides, class notes, and more).

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
- AI-powered tutoring using the Feynman technique.
- Real-time voice-based interactions.
- Customizable agent capabilities via OpenAI.
- Tailored feedback and guidance for student understanding.

## Technology Stack
- Python for backend development.
- FastAPI for API development.
- Next.js for frontend UI.
- TypeScript for type safety in JavaScript code.
- Tailwind CSS for styling.
- LiveKit for real-time communication.
- Beyond Presence for avatar-based interactions.

## Prerequisites
- Python 3.x installed on your machine.
- Node.js installed for the frontend.
- Familiarity with virtual environments in Python.

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

3. Create a `.env` file in the root directory:
    ```plaintext
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

## Running the Application
- Run the backend with the command:
    ```bash
    python agent.py dev
    ```
- Start the frontend server using:
    ```bash
    npm run dev
    ```

## Testing
Not found in codebase.

## Deployment
Not found in codebase.

## Contributing
To contribute to the project, please follow the guidelines set in the [CONTRIBUTING.md](#) file if available.

## License
Not found in codebase.

## Suggestions for Improvement
- Information on testing frameworks and commands should be added.
- Deployment instructions (e.g., Docker configuration) should be included.
- License information should be specified if applicable.