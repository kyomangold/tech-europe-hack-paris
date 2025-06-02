# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique - learn by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words; the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from a provided PDF (e.g., textbook, lecture slides, and more).

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
- Real-time voice-based interactions
- AI feedback on student explanations
- Teacher Mode for searching and retrieving information

## Technology Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Python
- **Dependencies**:
  - LiveKit: `livekit==1.0.8`
  - Dotenv for environment variable management: `python-dotenv==1.1.0`

## Prerequisites
- Python 3.x
- Node.js and npm
- Knowledge of Next.js and Python development

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

## Configuration
Information not found in codebase.

## Running the Application
- Use the above installation instructions to run the development server for both frontend and backend.

## API Documentation
Information not found in codebase.

## Project Structure
- The project consists of a well-organized directory structure with separated backend and frontend directories as outlined above.

## Testing
No test cases found in the codebase.

## Deployment
Not found in codebase.

## Contributing
Contributions are welcome. Please refer to the following contributors:
- Kyo Mangold (https://github.com/kyomangold)
- Daniel Gisler (https://github.com/gislerda)

## License
Not found in codebase.

---

### Suggested Improvements:
- Include configuration details for specific environment settings.
- Add API documentation for the backend once its structure is defined.
- Provide deployment instructions especially if Docker or CI/CD is used.
- Create and include tests to enhance project reliability.