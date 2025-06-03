# API Endpoints Overview
This document provides a comprehensive overview of the API endpoints available for interaction with the study management application. Each endpoint allows you to perform specific actions such as creating topics, uploading study materials, and retrieving study metrics.

## API Endpoints

| Path                        | HTTP Method | Function Name          | Short Description |
|-----------------------------|-------------|------------------------|-------------------|
| /api/give-more-info         | POST        | api_give_more_info     |                   |
| /api/upload-study-material   | POST        | api_upload_study_material|                   |
| /api/create-topic           | POST        | create_topic           |                   |
| /api/study-planner          | POST        | api_study_planner      |                   |
| /api/study-sessions         | GET         | read_study_sessions    |                   |
| /api/topics                 | GET         | read_topics            |                   |
| /api/current-topic          | GET         | get_current_topic      |                   |
| /api/topic-progress         | GET         | get_topic_progress     |                   |
| /api/next-up-topics        | GET         | get_next_up_topics     |                   |
| /api/study-goals           | GET         | get_study_goals        |                   |
| /api/improvement-areas      | GET         | get_improvement_areas  |                   |
| /api/study-metrics         | GET         | get_study_metrics      |                   |
| /api/connection-details      | GET         | get_connection_details  |                   |
| /api/current-session        | POST        | set_current_session     |                   |
| /api/current-session        | GET         | get_current_session     |                   |