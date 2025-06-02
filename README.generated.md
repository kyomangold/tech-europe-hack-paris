# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words; the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from a provided PDF (e.g., textbook, lecture slides, notes, and more).

![Best-In-Class AI Tutor Screenshot](./best_in_class_ai_feynman.png)

## Project Structure

### Backend
- **`agent.py`**: Main LiveKit agent implementation with Beyond Presence
- **`requirements.txt`**: Python dependencies

### Frontend
- Next.js application with TypeScript and Tailwind CSS
- **Components**:
  - **`NoAgentNotification.tsx`**: UI for when no agent is available
  - **`TranscriptionView.tsx`**: Real-time transcription display for improved accessibility
  - **`CloseIcon.tsx`**: UI component for closing modals
- **App Structure**:
  - **`app/page.tsx`**: Main application page
  - **`app/layout.tsx`**: Root layout component
  - **`app/api/`**: API routes
  - **`hooks/`**: Custom React hooks

## Features
- AI-powered tutoring using voice-based interactions.
- Real-time transcriptions for accessibility.
- Integration with OpenAI for searching additional resources.

## Technology Stack
- **Backend**: Python, LiveKit
- **Frontend**: Next.js, TypeScript, Tailwind CSS

## Prerequisites
- Python 3.x
- Node.js and npm

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

## Running the Application
The application can be run in development mode using the commands provided in the installation section. Be sure to start both the Python backend and the Next.js frontend.

## API Documentation
**Information not found in codebase.** Consider adding documentation for the API endpoints if available.

## Testing
**Information not found in codebase.** No tests were found, and no testing framework is defined. You may want to create tests for the application to ensure reliability.

## Deployment
**Information not found in codebase.** No deployment instructions were found. Consider adding information about how to deploy the application once it's ready.

## Contributing
- **Kyo Mangold** (https://github.com/kyomangold)
- **Daniel Gisler** (https://github.com/gislerda)

## License
**Information not found in codebase.** Consider adding a LICENSE file to specify the licensing of the project.

---

This README provides a comprehensive overview of the project based on the existing codebase. Several sections, such as API documentation and testing, need to be further developed to enhance the documentation quality.