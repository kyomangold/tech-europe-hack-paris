"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import TranscriptionView from "@/components/TranscriptionView";
import {
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

// Add these types before the StudyProgressCarousel component
type StudyGoal = {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
};

type ImprovementArea = {
  id: string;
  topic: string;
  currentLevel: number;
  targetLevel: number;
  description: string;
};

type StudyMetric = {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
};

type StudySession = {
  id: string;
  date: string;
  mastery: number;
  duration: number;
  topic: string;
};

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
            <div className="h-1/2 p-4 border-b border-amber-200 overflow-y-auto">
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
            <div className="h-1/2 flex flex-col bg-amber-100">
              <div className="p-4">
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

              <div className="mt-auto p-4 border-t border-amber-200">
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
              <div className="h-full">
                <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} />
              </div>
            </div>

            {/* Bottom Half - New Layout */}
            <div className="h-1/2 mt-4 grid grid-cols-3 gap-4">
              {/* Left Column - Buttons */}
              <div className="col-span-1 flex flex-col gap-4">
                <button
                  className="p-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center shadow-sm"
                  onClick={onConnectButtonClicked}
                >
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
            <div className="text-center text-amber-800">
              <p className="text-lg">Click &ldquo;Start Next Study Session&rdquo; to begin</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex flex-col h-full"
          >
            <div className="flex-1 min-h-0 flex">
              <div className="w-2/3">
                <AgentVisualizer />
              </div>
              <div className="w-1/3 bg-amber-50 rounded-lg ml-4 flex flex-col">
                <div className="p-2 border-b border-amber-200">
                  <h3 className="text-sm font-medium text-amber-900">Conversation</h3>
                </div>
                <div className="flex-1 min-h-0">
                  <TranscriptionView />
                </div>
              </div>
            </div>
            <div className="w-full mt-4">
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
  const { videoTrack } = useVoiceAssistant();

  if (videoTrack) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-amber-50">
          <VideoTrack trackRef={videoTrack} />
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full aspect-video bg-amber-50 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p className="text-amber-800 font-medium">Waiting for connection...</p>
        </div>
      </div>
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
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
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
            className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center"
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
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [improvementAreas, setImprovementAreas] = useState<ImprovementArea[]>([]);
  const [studyMetrics, setStudyMetrics] = useState<StudyMetric[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [hoveredSession, setHoveredSession] = useState<StudySession | null>(null);

  // Fetch data from endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would be actual API endpoints
        const goalsResponse = await fetch('/api/study-goals');
        const goalsData = await goalsResponse.json();
        setStudyGoals(goalsData);

        const areasResponse = await fetch('/api/improvement-areas');
        const areasData = await areasResponse.json();
        setImprovementAreas(areasData);

        const metricsResponse = await fetch('/api/study-metrics');
        const metricsData = await metricsResponse.json();
        setStudyMetrics(metricsData);

        const sessionsResponse = await fetch('/api/study-sessions');
        const sessionsData = await sessionsResponse.json();
        setStudySessions(sessionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set mock data for development
        setStudyGoals([
          { id: '1', title: 'Complete ML Basics', targetDate: '2024-04-01', progress: 100 },
          { id: '2', title: 'Master Neural Networks', targetDate: '2024-05-01', progress: 30 },
        ]);
        setImprovementAreas([
          { id: '1', topic: 'Linear Algebra', currentLevel: 3, targetLevel: 5, description: 'Need more practice with matrix operations' },
          { id: '2', topic: 'Statistics', currentLevel: 4, targetLevel: 5, description: 'Focus on probability distributions' },
        ]);
        setStudyMetrics([
          { id: '1', name: 'Study Hours', value: 45, unit: 'hours', trend: 'up' },
          { id: '2', name: 'Practice Problems', value: 120, unit: 'problems', trend: 'up' },
        ]);
        setStudySessions([
          { id: '1', date: '2024-03-01', mastery: 0.8, duration: 60, topic: 'ML Basics' },
          { id: '2', date: '2024-03-02', mastery: 0.6, duration: 45, topic: 'Neural Networks' },
          { id: '3', date: '2024-03-03', mastery: 0.9, duration: 90, topic: 'ML Basics' },
        ]);
      }
    };

    fetchData();
  }, []);

  const slides = [
    {
      title: "Study Goals",
      content: (
        <div className="space-y-3">
          {studyGoals.map((goal) => (
            <div key={goal.id} className="p-3 bg-amber-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${goal.progress === 100 ? 'bg-green-500 border-green-600' : 'border-amber-400'
                    }`} />
                  <h4 className="font-medium text-amber-900">{goal.title}</h4>
                </div>
                <span className="text-sm text-amber-700">
                  {goal.progress === 100 ? 'Done' : 'Todo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Areas for Improvement",
      content: (
        <div className="space-y-4">
          {improvementAreas.map((area) => (
            <div key={area.id} className="p-3 bg-amber-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-amber-900">{area.topic}</h4>
                <span className="text-sm text-amber-700">Level {area.currentLevel}/{area.targetLevel}</span>
              </div>
              <p className="text-sm text-amber-800">{area.description}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Study Metrics",
      content: (
        <div className="space-y-4">
          {studyMetrics.map((metric) => (
            <div key={metric.id} className="p-3 bg-amber-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-amber-900">{metric.name}</h4>
                <span className="text-sm text-amber-700">
                  {metric.value} {metric.unit}
                  <span className={`ml-2 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-amber-500'}`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Progress Graph",
      content: (
        <div className="relative h-[calc(100%-2rem)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full p-4">
              <div className="relative w-full h-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-amber-700">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Graph area */}
                <div className="absolute left-12 right-0 top-0 bottom-0">
                  {/* Grid lines */}
                  <div className="absolute inset-0 grid grid-rows-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="border-t border-amber-100" />
                    ))}
                  </div>

                  {/* Data points and lines */}
                  <div className="absolute inset-0">
                    <svg className="w-full h-full">
                      {/* Lines between points */}
                      {studySessions.map((session, index) => {
                        if (index === studySessions.length - 1) return null;
                        const x1 = (index / (studySessions.length - 1)) * 100;
                        const y1 = (1 - session.mastery) * 100;
                        const x2 = ((index + 1) / (studySessions.length - 1)) * 100;
                        const y2 = (1 - studySessions[index + 1].mastery) * 100;

                        return (
                          <line
                            key={`line-${session.id}`}
                            x1={`${x1}%`}
                            y1={`${y1}%`}
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke="#F59E0B"
                            strokeWidth="2"
                            strokeDasharray="4"
                          />
                        );
                      })}
                    </svg>

                    {/* Data points */}
                    {studySessions.map((session, index) => {
                      const x = (index / (studySessions.length - 1)) * 100;
                      const y = (1 - session.mastery) * 100;
                      const color = session.mastery >= 0.7 ? 'bg-green-500' :
                        session.mastery >= 0.4 ? 'bg-amber-500' :
                          'bg-red-500';

                      return (
                        <div
                          key={session.id}
                          className={`absolute w-3 h-3 rounded-full ${color} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125`}
                          style={{ left: `${x}%`, top: `${y}%` }}
                          onMouseEnter={(e) => {
                            setHoveredSession(session);
                            const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                            if (tooltip) {
                              tooltip.style.left = `${x}%`;
                              tooltip.style.top = `${y}%`;
                            }
                          }}
                          onMouseLeave={() => setHoveredSession(null)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredSession && (
            <div
              className="absolute bg-white p-2 rounded-lg shadow-lg text-sm transform -translate-x-1/2 -translate-y-full -mt-2"
              style={{
                left: `${(studySessions.findIndex(s => s.id === hoveredSession.id) / (studySessions.length - 1)) * 100}%`,
                top: `${(1 - hoveredSession.mastery) * 100}%`
              }}
            >
              <p className="font-medium text-amber-900">{hoveredSession.topic}</p>
              <p className="text-amber-700">Mastery: {Math.round(hoveredSession.mastery * 100)}%</p>
              <p className="text-amber-700">Duration: {hoveredSession.duration} min</p>
              <p className="text-amber-700">{new Date(hoveredSession.date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )
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
          className="h-full"
        >
          <h3 className="text-xl font-bold text-amber-900 mb-4">{slides[currentSlide].title}</h3>
          {slides[currentSlide].content}
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
