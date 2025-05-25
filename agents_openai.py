# agents_openai.py

import aiofiles
import openai
from agents import Agent, function_tool, Runner

# Define and initialize the agent only once
tutor_agent = Agent(
    name="TutorAgent",
    instructions="You are a helpful AI tutor. Use tools and files as needed.",
    tools=["web-search"],
    model="gpt-4o"
)

# File Upload (returns OpenAI file handle)
async def upload_study_material(file_path: str) -> str:
    async with aiofiles.open(file_path, "rb") as f:
        file_data = await f.read()

    uploaded_file = await openai.files.create(
        file=(file_path, file_data, "application/pdf"),
        purpose="assistants"
    )
    return uploaded_file.id
# 1. Function tools as plain async or sync functions
@function_tool
def generate_topic_summary(document_text: str, user_input: str) -> str:
    """
    Given study material and a user's goal, generate:
    - a 2–3 sentence summary
    - 3–5 bullet points of key concepts
    """
    return (
        f"Given the following study material:\n\n{document_text}\n\n"
        f"And the user's learning goal: '{user_input}',\n"
        "Generate a concise summary (2–3 sentences), followed by 3–5 bullet points of the key concepts."
    )

@function_tool
def generate_study_plan(topic_description: str) -> str:
    """
    Given a topic description, create a study plan with 3-5 lessons in JSON format.
    Each lesson should have a title and a short description.
    The output will be a JSON string that can be parsed and inserted into the database.
    """
    return (
        f"Create a study plan for this topic:\n\n{topic_description}\n\n"
        "Return the response in the following JSON format:\n"
        "{\n"
        '  "lessons": [\n'
        '    {\n'
        '      "title": "Lesson Title",\n'
        '      "description": "Short description of the lesson"\n'
        '    },\n'
        '    ...\n'
        '  ]\n'
        "}\n\n"
        "Rules:\n"
        "1. Maximum 5 lessons\n"
        "2. Each lesson must have a clear, concise title\n"
        "3. Each lesson must have a brief description\n"
        "4. Return ONLY the JSON, no other text\n"
        "5. Ensure the JSON is valid and properly formatted"
    )
    
@function_tool
def generate_topic_title(document_text: str, user_input: str) -> str:
    """
    Given study material and a user's goal, generate a concise, academic-sounding topic title.
    The title should be a single word or short phrase, e.g., 'Trigonometry', 'Gradient Descent', 'Schrödinger Equation'.
    """
    return (
        f"Given the following study material:\n\n{document_text}\n\n"
        f"And the user's learning goal: '{user_input}',\n"
        "Suggest a single-word or short academic phrase as a topic title, e.g., 'Trigonometry', 'Gradient Descent', or 'Schrödinger Equation'."
    )

# 2. Define the agent with tools (hosted and function tools together)
tutor_agent = Agent(
    name="TutorAgent",
    instructions="You are a helpful AI tutor. Use tools and files as needed.",
    tools=[
        "web-search",                 # hosted tool: web search
        generate_topic_summary,       # your Python function tool
        generate_study_plan,           # your Python function tool
        generate_topic_title          # your Python function tool
    ],
    model="gpt-4o"
)

# 3. Utility functions to run agent/tools

async def give_more_info(query: str):
    """Invoke agent on a web query (uses web-search tool)."""
    result = await Runner.run(tutor_agent, input=query)
    return result.final_output

async def call_generate_topic_summary(document_text: str, user_input: str):
    """Call the topic summary tool directly (function tool)."""
    result = await Runner.run(
        tutor_agent,
        input=f"Use the generate_topic_summary tool to summarize this topic. Document text: {document_text}\nUser input: {user_input}"
    )
    return result.final_output

async def call_generate_study_plan(topic_description: str):
    """Call the study planner tool directly (function tool)."""
    result = await Runner.run(
        tutor_agent,
        input=f"Use the generate_study_plan tool to create a study plan for this topic: {topic_description}"
    )
    return result.final_output

async def call_generate_topic_title(document_text: str, user_input: str):
    """Call the topic title tool directly (function tool)."""
    result = await Runner.run(
        tutor_agent,
        input=f"Use the generate_topic_title tool to suggest a title. Document text: {document_text}\nUser input: {user_input}"
    )
    return result.final_output