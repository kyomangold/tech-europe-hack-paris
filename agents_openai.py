# agents_openai.py

from agents import Agent, function_tool, Runner

# Define and initialize the agent only once
tutor_agent = Agent(
    name="TutorAgent",
    instructions="You are a helpful AI tutor. Use tools and files as needed.",
    tools=["web-search"],
    model="gpt-4o"
)

# File Upload (returns OpenAI file handle)
async def upload_study_material(file_path):
    file_handle = tutor_agent.files.upload(file_path)
    return file_handle



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
    Given a topic description, create a study plan:
    - List 3–5 high-level lessons, each with a short description.
    """
    return (
        f"Create a study plan for this topic:\n\n{topic_description}\n\n"
        "List 3–5 high-level lessons, each with a short description."
    )

# 2. Define the agent with tools (hosted and function tools together)
tutor_agent = Agent(
    name="TutorAgent",
    instructions="You are a helpful AI tutor. Use tools and files as needed.",
    tools=[
        "web-search",                 # hosted tool: web search
        generate_topic_summary,       # your Python function tool
        generate_study_plan           # your Python function tool
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
        input=f"Summarize this topic for me.",
        tool_calls=[{
            "tool_name": "generate_topic_summary",
            "args": {
                "document_text": document_text,
                "user_input": user_input
            }
        }]
    )
    return result.final_output

async def call_generate_study_plan(topic_description: str):
    """Call the study planner tool directly (function tool)."""
    result = await Runner.run(
        tutor_agent,
        input=f"Plan lessons for this topic.",
        tool_calls=[{
            "tool_name": "generate_study_plan",
            "args": {
                "topic_description": topic_description
            }
        }]
    )
    return result.final_output

# 4. File upload (handled separately—see OpenAI SDK for uploading/storing files)
# This depends on your workflow; for file-based retrieval, see FileSearchTool in the docs.