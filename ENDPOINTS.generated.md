# API Endpoints Overview
This document provides an overview of the available API endpoints for the application. The API allows for the management of study-related resources, including sessions, topics, and goals.

## API Endpoints

| Path                         | HTTP Method | Function Name          | Short Description                  |
|------------------------------|-------------|------------------------|------------------------------------|
| /api/give-more-info          | POST        | api_give_more_info     | Submit additional information      |
| /api/upload-study-material    | POST        | api_upload_study_material | Upload study materials             |
| /api/create-topic            | POST        | create_topic           | Create a new study topic           |
| /api/study-planner           | POST        | api_study_planner      | Plan study schedule                |
| /api/study-sessions          | GET         | read_study_sessions     | Retrieve list of study sessions    |
| /api/topics                  | GET         | read_topics            | Retrieve list of topics            |
| /api/current-topic           | GET         | get_current_topic      | Get the current topic              |
| /api/topic-progress          | GET         | get_topic_progress     | Get progress of a topic            |
| /api/next-up-topics         | GET         | get_next_up_topics     | Get upcoming topics                |
| /api/study-goals             | GET         | get_study_goals        | Retrieve study goals               |
| /api/improvement-areas       | GET         | get_improvement_areas  | Retrieve areas for improvement     |
| /api/study-metrics           | GET         | get_study_metrics      | Retrieve study metrics             |
| /api/connection-details       | GET         | get_connection_details   | Get connection details             |
| /api/current-session         | POST        | set_current_session     | Set the current study session      |
| /api/current-session         | GET         | get_current_session     | Get current session details        |