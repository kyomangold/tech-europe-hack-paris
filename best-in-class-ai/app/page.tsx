"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import TranscriptionView from "@/components/TranscriptionView";
import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import type { ConnectionDetails } from "./api/connection-details/route";

export default function Page() {
  const [room] = useState(new Room());

  const onConnectButtonClicked = useCallback(async () => {
    // Generate room connection details, including:
    //   - A random Room name
    //   - A random Participant name
    //   - An Access Token to permit the participant to join the room
    //   - The URL of the LiveKit server to connect to
    //
    // In real-world application, you would likely allow the user to specify their
    // own participant name, and possibly to choose from existing rooms to join.

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData: ConnectionDetails = await response.json();

    await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
    await room.localParticipant.setMicrophoneEnabled(true);
  }, [room]);

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);

  return (
    <main data-lk-theme="default" className="h-screen bg-amber-50">
      <RoomContext.Provider value={room}>
        <div className="grid grid-cols-4 h-full">
          {/* Left Sidebar - 1/4 width */}
          <div className="col-span-1 flex flex-col border-r border-amber-200">
            {/* Top Section - Topics List (2/3 height) */}
            <div className="h-2/3 p-4 border-b border-amber-200 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-amber-900">Topics</h2>
                <button className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700">
                  New Topic
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="p-4 bg-white rounded-lg hover:bg-amber-100 cursor-pointer transition-colors">
                  <h3 className="text-lg font-bold mb-2 text-amber-900">Machine Learning Basics</h3>
                  <p className="text-sm text-amber-800">Introduction to ML concepts and algorithms</p>
                </div>
                <div className="p-4 bg-white rounded-lg hover:bg-amber-100 cursor-pointer transition-colors">
                  <h3 className="text-lg font-bold mb-2 text-amber-900">Neural Networks</h3>
                  <p className="text-sm text-amber-800">Deep learning and neural network architectures</p>
                </div>
                <div className="p-4 bg-white rounded-lg hover:bg-amber-100 cursor-pointer transition-colors">
                  <h3 className="text-lg font-bold mb-2 text-amber-900">Natural Language Processing</h3>
                  <p className="text-sm text-amber-800">Text processing and language models</p>
                </div>
              </div>
            </div>

            {/* Bottom Section - Topic Description (1/3 height) */}
            <div className="h-1/3 flex flex-col bg-amber-100">
              <div className="p-4 flex-1">
                <h4 className="text-2xl font-bold mb-3 text-amber-900">Machine Learning Basics</h4>
                <p className="text-base text-amber-800 mb-4">A comprehensive introduction to machine learning concepts, algorithms, and applications.</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-900">Key Facts:</p>
                  <ul className="text-sm list-disc list-inside space-y-1 text-amber-800">
                    <li>Supervised vs Unsupervised Learning</li>
                    <li>Common ML Algorithms</li>
                    <li>Model Evaluation Metrics</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border-t border-amber-200">
                <div className="border-2 border-dashed border-amber-300 rounded-lg p-4 text-center bg-white">
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-amber-600 hover:text-amber-700"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="font-medium">Upload Study Materials</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - 3/4 width */}
          <div className="col-span-3 p-4 flex flex-col">
            {/* Top Half - Existing Components */}
            <div className="h-1/2">
              <div className="lk-room-container h-full">
                <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} />
              </div>
            </div>

            {/* Bottom Half - New Layout */}
            <div className="h-1/2 mt-4 grid grid-cols-3 gap-4">
              {/* Left Column - Buttons */}
              <div className="col-span-1 flex flex-col gap-4">
                <button className="p-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center shadow-sm">
                  <span className="font-medium">Start Next Study Session</span>
                </button>
                <button className="p-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center shadow-sm">
                  <span className="font-medium">Give More Information</span>
                </button>

                {/* Progress Section */}
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-amber-900">Topic Progress</h4>
                    <span className="text-sm text-amber-700">1/5</span>
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                      initial={{ width: 0 }}
                      animate={{ width: "20%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Suggested Topics */}
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-amber-900 mb-3">Next Up</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-md cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">Linear Regression</p>
                        <p className="text-xs text-amber-700">Basic ML algorithm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-md cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">Decision Trees</p>
                        <p className="text-xs text-amber-700">Classification methods</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-md cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">Support Vector Machines</p>
                        <p className="text-xs text-amber-700">Advanced classification</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Graph/Image */}
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <StudyProgressCarousel />
              </div>
            </div>
          </div>
        </div>
      </RoomContext.Provider>
    </main>
  );
}

function SimpleVoiceAssistant(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <>
      <AnimatePresence mode="wait">
        {agentState === "disconnected" ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="grid items-center justify-center h-full"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="uppercase px-4 py-2 bg-white text-black rounded-md"
              onClick={() => props.onConnectButtonClicked()}
            >
              Start a conversation
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex flex-col items-center gap-4 h-full"
          >
            <AgentVisualizer />
            <div className="flex-1 w-full">
              <TranscriptionView />
            </div>
            <div className="w-full">
              <ControlBar onConnectButtonClicked={props.onConnectButtonClicked} />
            </div>
            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AgentVisualizer() {
  const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();

  if (videoTrack) {
    return (
      <div className="h-[512px] w-[512px] rounded-lg overflow-hidden">
        <VideoTrack trackRef={videoTrack} />
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full">
      <BarVisualizer
        state={agentState}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="relative h-[60px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={() => props.onConnectButtonClicked()}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}

function StudyProgressCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Study Progress",
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: "Overall study progress and completion rates"
    },
    {
      title: "Learning Patterns",
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      description: "Analysis of your learning patterns and habits"
    },
    {
      title: "Topic Mastery",
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Your mastery level across different topics"
    },
    {
      title: "Study Streak",
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      description: "Your current study streak and consistency"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center h-full flex flex-col items-center justify-center"
        >
          {slides[currentSlide].icon}
          <h3 className="text-xl font-bold text-amber-900 mb-2">{slides[currentSlide].title}</h3>
          <p className="text-amber-800">{slides[currentSlide].description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index ? 'bg-amber-600' : 'bg-amber-200'
              }`}
          />
        ))}
      </div>
    </div>
  );
}
