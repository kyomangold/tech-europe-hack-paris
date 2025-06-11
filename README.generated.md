# Best-In-Class – AI Tutor

The Best-In-Class AI-powered tutor helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words, and the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web or retrieve knowledge from provided PDFs (e.g., textbooks, lecture slides, class notes, flashcards, and more).

![Best-In-Class - AI Tutor Screenshot](./best_in_class_ai_feynman.png)

## Project Structure

### Backend
- `agent.py`: Main LiveKit agent implementation with Beyond Presence.
- `fastapi_backend.py`: Main backend implementation connecting everything to the frontend.
- `agents_openai.py`: OpenAI agent implementation.
- `requirements.txt`: Lists of Python dependencies.

### Frontend
- Next.js application with TypeScript and Tailwind CSS
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
- Real-time transcription for improved accessibility.
- Voice-based interactions using LiveKit and Beyond Presence.
- Teacher Mode powered by the OpenAI Agents API.
- Modular architecture with a clear separation of components for maintainability.

## Technology Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Python (FastAPI)
- **Other Libraries**:
  - livekit: 1.0.8
  - python-dotenv: 1.1.0

## Prerequisites
- Python 3.x
- Node.js (for frontend)
- npm (for package management in frontend)

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
- No specific configuration options were provided in the codebase for application configuration, database configuration, or environment variables beyond what is noted in the `.env` file example above.

## Running the Application
- The application can be run in development mode as detailed in the Installation section.

## API Documentation
- Information about API endpoints was not found in the codebase. To enhance this section, consider adding details on available endpoints and example requests/responses.

## Project Structure
The project is structured into a `backend` and `frontend` directory, with clear separation in components, services, and application logic as documented in the Project Structure section.

## Testing
- No test files or frameworks were found in the codebase. Consider adding tests to improve code coverage and reliability.

## Deployment
- No deployment configurations (e.g., Dockerfile, Kubernetes configurations) were found in the codebase. For deployment instructions, consider creating Docker containers or using cloud services.

## Contributing
- There are no contributing guidelines found in the existing README or in the codebase. It is suggested to include a CONTRIBUTING.md file for potential contributors.

## License
- No LICENSE file found in the codebase. It is recommended to specify a license for the project to clarify permissions and usage.