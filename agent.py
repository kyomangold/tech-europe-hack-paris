# agent.py

from dotenv import load_dotenv
import os
import sqlite3
import json

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, RoomOutputOptions, function_tool, get_job_context
from livekit.plugins import (
    openai,
    bey,
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.agents import ConversationItemAddedEvent
from livekit.agents.llm import ImageContent, AudioContent

import logging
logger = logging.getLogger(__name__)

# Add file handler for conversation logging
conversation_logger = logging.getLogger('conversation')
conversation_logger.setLevel(logging.INFO)
file_handler = logging.FileHandler('conversation.log')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
conversation_logger.addHandler(file_handler)

load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="You are a helpful voice AI tutor that uses the Feynman technique to help the student learn by letting them explain the topic in their own words to you.")
        
    async def on_enter(self) -> None:
        # Use topic_context if available
        topic = getattr(self.session, 'topic_context', None)
        if topic and topic.get('metadata') and 'name' in topic['metadata']:
            await self.session.say(f"Welcome to your next learning session on {topic['metadata']['name']}.")
        else:
            await self.session.say("What topic would you like to discuss?")
        
    @function_tool()
    async def give_task_for_topic(self) -> str:
        """Use this tool to instruct the student to explain the topic in under 1 minute."""

        await self.session.generate_reply(instructions="Tell the student to explain the topic in 1 minute")
    
    @function_tool()
    async def dig_deeper(self) -> str:
        """Use this tool to dig deeper into a specific part of thetopic if the student's explanation does not show sufficient understanding. If the student shows sufficient understanding, try to test their understanding of the topic further."""

        await self.session.generate_reply(instructions="Ask the student to explain a specific part of the topic again or test their understanding of the topic further.")
    
    @function_tool()
    async def give_feedback_and_end_conversation(self) -> None:
        """Use this tool to give feedback to the student and indicate that the conversation should end."""
        await self.session.generate_reply(instructions="Give feedback to the student on what they did well and what they could improve on.")
        await self.session.say("Thank you for using the best-in-class tutoring service. Have a wonderful day!")
        job_ctx = get_job_context()
        await job_ctx.api.room.delete_room(job_ctx.room.name)

class Teacher(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="You are an engaging and knowledgeable teacher who provides detailed explanations and answers questions about academic topics.")
        self.current_topic = None
        self.mini_lecture_script = None
    async def on_enter(self) -> None:
        # Use topic_context if available
        topic = getattr(self.session, 'topic_context', None)
        if topic and topic.get('metadata') and 'name' in topic['metadata']:
            self.current_topic = topic['metadata']['name']
        if not self.current_topic:
            await self.session.say("I need a topic to provide information about. Please select a topic first.")
            return
        await self.session.say(f"I'm gathering some additional information about {self.current_topic}. Please wait a moment...")
        # Use web search to get more information
        search_result = await self.session.generate_reply(
            instructions=f"Search the web for detailed information about {self.current_topic}. Focus on key concepts, examples, and real-world applications."
        )
        # Generate a mini lecture script
        self.mini_lecture_script = await self.session.generate_reply(
            instructions=f"Based on the search results about {self.current_topic}, create a detailed 2-3 minute mini lecture. Include:\n"
            "1. A clear introduction to the topic\n"
            "2. Key concepts and their explanations\n"
            "3. Real-world examples or applications\n"
            "4. A brief summary\n"
            "Make it engaging and easy to understand."
        )
        await self.session.say(self.mini_lecture_script)
        await self.session.say("Do you have any questions about what I've explained? Feel free to ask anything!")
    @function_tool()
    async def set_topic(self, topic: str) -> None:
        self.current_topic = topic
    @function_tool()
    async def answer_question(self, question: str) -> str:
        await self.session.generate_reply(
            instructions=f"Answer the following question about {self.current_topic} in a clear and detailed way: {question}"
        )
    @function_tool()
    async def end_teaching_session(self) -> None:
        await self.session.generate_reply(instructions="Thank the student for their questions and indicate that the teaching session is ending.")
        await self.session.say("Thank you for your questions! Feel free to ask for more information anytime.")
        job_ctx = get_job_context()
        await job_ctx.api.room.delete_room(job_ctx.room.name)

async def entrypoint(ctx: agents.JobContext):

    await ctx.connect()
    session = AgentSession(
        stt=openai.STT(model="gpt-4o-transcribe"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(model="gpt-4o-mini-tts", voice="nova"),
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    # --- Fetch topic context from SQLite current_session table ---
    def get_current_session():
        conn = sqlite3.connect("best_in_class.db")
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT topic_id, session_id, metadata, mode FROM current_session WHERE id = 1")
            row = cursor.fetchone()
            if not row:
                return None
            topic_id, session_id, metadata, mode = row
            return {
                "topic_id": topic_id,
                "session_id": session_id,
                "metadata": json.loads(metadata) if metadata else None,
                "mode": mode
            }
        finally:
            conn.close()

    topic_context = get_current_session()
    print("[Agent] Topic context from DB:", topic_context)
    session.topic_context = topic_context
    
    @session.on("conversation_item_added")
    def on_conversation_item_added(event: ConversationItemAddedEvent):
        print(f"Conversation item added from {event.item.role}: {event.item.text_content}. interrupted: {event.item.interrupted}")
        # Log to file
        # conversation_logger.info(f"From {event.item.role}: {event.item.text_content}")
        # to iterate over all types of content:
        for content in event.item.content:
            if isinstance(content, str):
                print(f" - text: {content}")
                conversation_logger.info(f"Text content: {content}")
            elif isinstance(content, ImageContent):
                # image is either a rtc.VideoFrame or URL to the image
                print(f" - image: {content.image}")
                conversation_logger.info(f"Image content: {content.image}")
            elif isinstance(content, AudioContent):
                # frame is a list[rtc.AudioFrame]
                print(f" - audio: {content.frame}, transcript: {content.transcript}")
                conversation_logger.info(f"Audio content - transcript: {content.transcript}")

    avatar_id = os.getenv("BEY_AVATAR_ID")
    bey_avatar = bey.AvatarSession(avatar_id=avatar_id)
    await bey_avatar.start(session, room=ctx.room)

    # Determine which agent to use based on the mode in the DB
    mode = topic_context.get('mode') if topic_context else None
    logger.info(f"Mode from DB: {topic_context}")
    if mode == 'teacher':
        logger.info("Using Teacher agent")
        agent = Teacher()
    else:
        logger.info("Using Assistant agent")
        agent = Assistant()

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(), 
        ),
        room_output_options=RoomOutputOptions(audio_enabled=False),
    )

    

    # await session.generate_reply(
    #     instructions="Greet the user and offer your assistance."
    # )
    
    


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))