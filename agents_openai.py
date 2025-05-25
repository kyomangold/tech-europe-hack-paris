# agents_openai.py

import aiofiles
import openai
from agents import Agent, function_tool, Runner

# Define function tools
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
    Given a topic description, create a study plan:
    - List 3–5 high-level lessons, each with a short description.
    """
    return (
        f"Create a study plan for this topic:\n\n{topic_description}\n\n"
        "List 3–5 high-level lessons, each with a short description."
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

# Define the agent with tools
tutor_agent = Agent(
    name="TutorAgent",
    instructions="You are a helpful AI tutor. Use tools and files as needed.",
    tools=[
        generate_topic_summary,
        generate_study_plan,
        generate_topic_title
    ],
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

# Utility functions to run agent/tools
async def give_more_info(query: str):
    """Invoke agent on a web query."""
    try:
        result = await Runner.run(
            tutor_agent,
            input=query
        )
        return result.final_output
    except Exception as e:
        print(f"Error in give_more_info: {str(e)}")
        return f"I apologize, but I encountered an error while processing your request: {str(e)}"

async def call_generate_topic_summary(document_text: str, user_input: str):
    """Call the topic summary tool directly."""
    try:
        result = await Runner.run(
            tutor_agent,
            input=f"Use the generate_topic_summary tool to summarize this topic. Document text: {document_text}\nUser input: {user_input}"
        )
        return result.final_output
    except Exception as e:
        print(f"Error in call_generate_topic_summary: {str(e)}")
        return f"I apologize, but I encountered an error while generating the summary: {str(e)}"

async def call_generate_study_plan(topic_description: str):
    """Call the study planner tool directly."""
    try:
        result = await Runner.run(
            tutor_agent,
            input=f"Use the generate_study_plan tool to create a study plan for this topic: {topic_description}"
        )
        return result.final_output
    except Exception as e:
        print(f"Error in call_generate_study_plan: {str(e)}")
        return f"I apologize, but I encountered an error while generating the study plan: {str(e)}"

async def call_generate_topic_title(document_text: str, user_input: str):
    """Call the topic title tool directly."""
    try:
        result = await Runner.run(
            tutor_agent,
            input=f"Use the generate_topic_title tool to suggest a title. Document text: {document_text}\nUser input: {user_input}"
        )
        return result.final_output
    except Exception as e:
        print(f"Error in call_generate_topic_title: {str(e)}")
        return f"I apologize, but I encountered an error while generating the title: {str(e)}"
