# Best-In-Class – AI Tutor

The **Best-In-Class** AI-powered tutor helps students master any subject using the Feynman technique - learning by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words while the AI provides feedback, guidance, and targeted questions to deepen their understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search for more information or retrieve knowledge from uploaded materials such as textbooks, lecture slides, notes, quizzes, and flashcards.

![Best-In-Class - AI Tutor Screenshot](./best_in_class_ai_feynman.png)

## Project Structure

### Backend
- `agent.py`: Main LiveKit agent implementation with Beyond Presence.
- `fastapi_backend.py`: Main backend implementation connecting everything to the frontend.
- `agents_openai.py`: OpenAI agent implementation.
- `requirements.txt`: Python dependencies.

### Frontend
- Next.js application with TypeScript and Tailwind CSS.
- **Components**:
  - `NoAgentNotification.tsx`: UI for when no agent is available.
  - `TranscriptionView.tsx`: Real-time transcription display for improved accessibility.
  - `CloseIcon.tsx`: UI component for closing modals.
- **App Structure**:
  - `app/page.tsx`: Main application page.
  - `app/layout.tsx`: Root layout component.
  - `app/api/`: API routes.
  - `hooks/`: Custom React hooks.

## Features
- Real-time voice-based tutoring.
- Ability to explain concepts and receive constructive feedback from AI.
- Integration with OpenAI API for extended capabilities in Teacher Mode.

## Technology Stack
- Python
- FastAPI
- Next.js
- TypeScript
- Tailwind CSS
- LiveKit
- Beyond Presence
- OpenAI API

## Prerequisites
- Python 3.x
- Node.js
- npm (Node package manager)

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
- Information regarding specific configurations found in the project is located in the `.env` file mentioned in the backend setup section. More details on options should be added to the `.env.example` and respective setup instructions for clarity.

## Running the Application
To run the application:
- Ensure both backend and frontend are running in development mode as described in the installation section.

## API Documentation
- Not found in codebase. It is recommended to integrate API documentation, like Swagger, for easier access to available endpoints.

## Testing
- No tests found in the codebase. Consider implementing testing for both frontend and backend components.

## Deployment
- Not found in codebase. Detailed deployment instructions should be added, including containerization with Docker or other CI/CD practices.

## Contributing
- Not found in codebase. Consider creating a `CONTRIBUTING.md` file to guide future contributions.

## License
- Not found in codebase. A `LICENSE` file should be added to clarify the project's licensing terms.

This README document serves as a comprehensive guide to understanding and working with the Best-In-Class – AI Tutor project. It is recommended to add missing pieces of information, especially for configuration, API documentation, tests, and deployment instructions to enhance clarity and usability.