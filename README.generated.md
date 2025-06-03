# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words; the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode" the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from provided PDFs (e.g., textbooks, lecture slides, notes, and more).

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
- Real-time voice-based interactions through LiveKit.
- Feynman technique-based tutoring to deepen understanding.
- Integration with OpenAI Agents API for dynamic content.
- Custom UI components for better user experience.

## Technology Stack
- **Backend**: Python with FastAPI
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Real-time Communication**: LiveKit
- **AI Integration**: OpenAI Agents API

## Prerequisites
- Python 3.6 or higher
- Node.js (for frontend setup)
- A package manager like pip for Python dependencies
- Basic knowledge of setting up virtual environments

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

## Configuration
Configuration for the application is primarily managed through environmental variables defined in the `.env` file. Make sure to provide all necessary keys for the APIs used.

## Running the Application
- The backend runs on the default FastAPI development server port (usually `8000`).
- Frontend runs on port `3000` by default when started using npm.

## Testing
- The project does not currently contain any test files or frameworks for testing.
  
## Deployment
- Not found in codebase.

## Contributing

Contributions are welcome! Please follow the standard practices for submitting issues and pull requests.

## License
- Not found in codebase.

---

This README serves as a foundation to guide users through the setup and understanding of the project. Additional details regarding deployment and testing should be added as the project evolves.