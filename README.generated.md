# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words; the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from a provided PDF (e.g., textbook, lecture slides, notes, and more).

![Best-In-Class AI Tutor Screenshot](./best_in_class_ai_feynman.png)

## Project Structure

### Backend
- `agent.py`: Main LiveKit agent implementation with Beyond Presence
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
- Real-time voice-based interactions with AI
- Feynman technique for enhanced learning
- Integration with OpenAI Agents API for accessing additional knowledge
- UI components for improved user experience
- Accessibility features like real-time transcription

## Technology Stack
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Python, LiveKit, Beyond Presence
- Dependencies: 
  - `livekit==1.0.8`
  - `python-dotenv==1.1.0`

## Prerequisites
- Python 3.x
- Node.js (for frontend)
- npm (for package management)

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
    ```ini
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

## Configuration
Specific configuration options are primarily stored in the `.env` file created during setup. These configurations include API keys for external services.

## Running the Application
- Use the provided commands above to run both the backend and frontend in development mode.

## API Documentation
Not found in codebase.

## Project Structure
- The project is organized into backend and frontend directories as described above.

## Testing
No testing framework or test files were found in the codebase.

## Deployment
No specific deployment instructions are found in the codebase.

## Contributing
Contributions are welcome! Please refer to [Kyo Mangold](https://github.com/kyomangold) or [Daniel Gisler](https://github.com/gislerda) for any contributions or collaboration.

## License
Not found in codebase.

---

Suggestions for Additional Sections:
- API Documentation: Define the endpoints and their usage.
- Testing Instructions: Provide details if tests are to be added in the future.
- License Information: Add license details for clarity.

Feel free to enhance this README further with contributions from team members!