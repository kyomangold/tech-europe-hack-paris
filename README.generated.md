# Best-In-Class – AI Tutor

An AI-powered tutor that helps students master any subject using the Feynman technique—learn by teaching. The platform features a Next.js frontend and a Python backend with LiveKit and Beyond Presence integration for real-time, voice-based interactions. Students explain concepts in their own words; the AI provides feedback, guidance, and targeted questions to deepen understanding. In "Teacher Mode," the AI can leverage the OpenAI Agents API to search the web for more information or retrieve knowledge from a provided PDF (e.g., textbook, lecture slides, and more).

![Best-In-Class AI Tutor Screenshot](./best_in_class_ai_feynman.png)

## Project Structure

### Backend
- `agent.py`: Main LiveKit agent implementation with Beyond Presence.
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
- Real-time voice-based interactions.
- Interactive learning using the Feynman technique.
- Support for teacher and student modes, enhancing the learning experience.
- Integration with OpenAI Agents API for extended search capabilities.

## Technology Stack
- Python (Backend)
- Next.js (Frontend)
- TypeScript
- Tailwind CSS
- LiveKit
- Beyond Presence

## Prerequisites
- Python 3.6 or higher
- Node.js and npm installed
- Access to OpenAI API with a valid API key
- LiveKit credentials

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

3. Create a `.env` file in the root directory with the following content:
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
- A sample `.env` file is provided as `.env.example` in the root directory. Customize this file with your actual API keys and settings.

## Running the Application
- The application consists of a backend running on FastAPI and a frontend on Next.js. Follow the setup steps for both backend and frontend to run the application in development mode.

## API Documentation
- No API documentation was found in the codebase. It is suggested to implement an API documentation tool or provide examples for the API endpoints utilized.

## Project Structure
- The overall project contains both backend and frontend components, as detailed in the "Project Structure" section.

## Testing
- There are no test files or frameworks found in the codebase. It is suggested to implement testing for both the frontend and backend to ensure code quality.

## Deployment
- Not found in codebase. It is recommended to include Docker configurations or deployment instructions.

## Contributing
- Not found in codebase. It is suggested to include a `CONTRIBUTING.md` file to guide potential contributors.

## License
- Not found in codebase. It is suggested to include a `LICENSE` file to specify the project's licensing terms.

---

This README has been enhanced and updated based on the existing content and codebase structure. For further enhancements, consider adding examples, tests, deployment instructions, and a license.