# agents_openai.py

from openai.agents import OpenAIAgent, tool

# Define and initialize the agent only once
tutor_agent = OpenAIAgent(
    name="TutorAgent",
    instructions="You are a helpful AI tutor. Use tools and files as needed.",
    tools=["web-search"],
    model="gpt-4o"
)

# File Upload (returns OpenAI file handle)
async def upload_study_material(file_path):
    file_handle = tutor_agent.files.upload(file_path)
    return file_handle

# Give More Info via web-search
async def give_more_info(query):
    response = tutor_agent.run(query)
    return response.output

# Custom tool: Generate topic summary/keypoints (registered as a tool for agent use)
@tool
def generate_topic_summary(document_text: str, user_input: str) -> dict:
    summary_prompt = (
        f"Given the following study material:\n\n{document_text}\n\n"
        f"And the user's learning goal: '{user_input}',\n"
        "Generate a concise summary (2–3 sentences), followed by 3–5 bullet points of the key concepts."
    )
    return {"prompt": summary_prompt}

tutor_agent.add_tool(generate_topic_summary)

async def call_generate_topic_summary(document_text, user_input):
    resp = tutor_agent.run_tool("generate_topic_summary", document_text=document_text, user_input=user_input)
    return resp.output

# Custom tool: Study planner
@tool
def generate_study_plan(topic_description: str) -> dict:
    plan_prompt = (
        f"Create a study plan for this topic:\n\n{topic_description}\n\n"
        "List 3–5 high-level lessons, each with a short description."
    )
    return {"prompt": plan_prompt}

tutor_agent.add_tool(generate_study_plan)

async def call_generate_study_plan(topic_description):
    resp = tutor_agent.run_tool("generate_study_plan", topic_description=topic_description)
    return resp.output