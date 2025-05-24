# agent.py

from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, function_tool, get_job_context
from livekit.plugins import (
    openai,
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


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        stt=openai.STT(model="gpt-4o-transcribe"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(model="gpt-4o-mini-tts"),
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )
    
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

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(), 
        ),
    )

    await ctx.connect()

    # await session.generate_reply(
    #     instructions="Greet the user and offer your assistance."
    # )
    
    


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))