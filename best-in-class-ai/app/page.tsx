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
import { NewTopicDialog } from "./components/NewTopicDialog";

// Add these types before the StudyProgressCarousel component
type ImprovementArea = {
  lesson_id: number;
  lesson_title: string;
  topic_name: string;
  progress: number;
  missing_goals: number;
};

type StudyMetric = {
  topic_id: number;
  topic_name: string;
  study_hours: number;
  session_count: number;
  day_streak: number;
  overall_progress: number;
};

type StudySession = {
  id: number;
  topic_id: number;
  lesson_id: number;
  session_datetime: string;
  length_minutes: number;
  mastery_score: number;
};

type Topic = {
  id: number;
  name: string;
  description: string | null;
  key_points: string[] | null;
  progress: number;
  session_count: number;
  day_streak: number;
  overall_progress: number;
};

type TopicProgress = {
  topic_id: number;
  topic_name: string;
  total_lessons: number;
  completed_lessons: number;
};

type NextUpTopic = {
  id: number;
  name: string;
  description: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
};

export default function Page() {
  const [room] = useState(new Room());
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress | null>(null);
  const [nextUpTopics, setNextUpTopics] = useState<NextUpTopic[]>([]);
  const [isNewTopicDialogOpen, setIsNewTopicDialogOpen] = useState(false);

  const fetchCurrentTopic = async (topicId?: number) => {
    try {
      const url = new URL('http://localhost:8000/api/current-topic');
      if (topicId !== undefined) {
        url.searchParams.append('topic_id', topicId.toString());
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch current topic');
      }
      const data = await response.json();
      setCurrentTopic(data);
    } catch (error) {
      console.error('Error fetching current topic:', error);
      // Mock data for development
      setCurrentTopic({
        id: 1,
        name: "TODO Trigonometry",
        description: "Study of sine, cosine, tangent, etc.",
        key_points: null,
        progress: 5.5,
        session_count: 7,
        day_streak: 3,
        overall_progress: 0.78
      });
    }
  };

  const fetchTopicProgress = async (topicId?: number) => {
    try {
      const url = new URL('http://localhost:8000/api/topic-progress');
      if (topicId !== undefined) {
        url.searchParams.append('topic_id', topicId.toString());
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch topic progress');
      }
      const data = await response.json();
      setTopicProgress(data);
    } catch (error) {
      console.error('Error fetching topic progress:', error);
      // Mock data for development
      setTopicProgress({
        topic_id: 1,
        topic_name: "Trigonometry",
        total_lessons: 5,
        completed_lessons: 1
      });
    }
  };

  const handleTopicClick = async (topicId: number) => {
    await Promise.all([
      fetchCurrentTopic(topicId),
      fetchTopicProgress(topicId)
    ]);

    // Dispatch custom event for topic change
    window.dispatchEvent(new CustomEvent('topicChange', {
      detail: { topicId }
    }));
  };

  // Fetch topics data
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/topics');
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
        // Mock data for development
        setTopics([
          {
            id: 1,
            name: "TODO Trigonometry",
            description: null,
            key_points: null,
            progress: 5.5,
            session_count: 7,
            day_streak: 3,
            overall_progress: 0.78
          },
          {
            id: 2,
            name: "TODO Linear Algebra",
            description: null,
            key_points: null,
            progress: 3.2,
            session_count: 4,
            day_streak: 1,
            overall_progress: 0.45
          },
          {
            id: 3,
            name: "TODO Calculus",
            description: null,
            key_points: null,
            progress: 6,
            session_count: 0,
            day_streak: 0,
            overall_progress: 0
          }
        ]);
      }
    };

    const fetchNextUpTopics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/next-up-topics');
        if (!response.ok) {
          throw new Error('Failed to fetch next up topics');
        }
        const data = await response.json();
        setNextUpTopics(data);
      } catch (error) {
        console.error('Error fetching next up topics:', error);
        // Mock data for development
        setNextUpTopics([
          {
            id: 2,
            name: "Linear Algebra",
            description: "Vectors, matrices, and operations",
            progress: 0.45,
            total_lessons: 4,
            completed_lessons: 1
          },
          {
            id: 3,
            name: "Calculus",
            description: "Derivatives and integrals",
            progress: 0.0,
            total_lessons: 6,
            completed_lessons: 0
          }
        ]);
      }
    };

    fetchTopics();
    fetchCurrentTopic();
    fetchTopicProgress();
    fetchNextUpTopics();
  }, []);

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
                <button
                  onClick={() => setIsNewTopicDialogOpen(true)}
                  className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  New Topic
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-4 bg-white rounded-lg hover:bg-amber-100 cursor-pointer transition-colors ${currentTopic?.id === topic.id ? 'ring-2 ring-amber-500' : ''
                      }`}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <h3 className="text-lg font-bold mb-2 text-amber-900">{topic.name}</h3>
                    <p className="text-sm text-amber-700">
                      {topic.session_count} sessions • {topic.progress.toFixed(1)} hours • {Math.round(topic.overall_progress * 100)}% complete
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section - Topic Description (1/3 height) */}
            <div className="h-1/2 flex flex-col bg-amber-100">
              <div className="p-4">
                <h4 className="text-2xl font-bold mb-3 text-amber-900">
                  {currentTopic?.name || "No topic selected"}
                </h4>
                <p className="text-base text-amber-800 mb-4">
                  {currentTopic?.description || "Select a topic to view its description"}
                </p>
                {currentTopic?.key_points && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-amber-900 mb-2">Key Points:</p>
                    <ul className="text-sm list-disc list-inside space-y-1 text-amber-800">
                      {(() => {
                        try {
                          const points = typeof currentTopic.key_points === 'string'
                            ? JSON.parse(currentTopic.key_points)
                            : currentTopic.key_points;
                          return points.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ));
                        } catch (e) {
                          console.error('Error parsing key points:', e);
                          return null;
                        }
                      })()}
                    </ul>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-900">Progress:</p>
                  <ul className="text-sm list-disc list-inside space-y-1 text-amber-800">
                    <li>{currentTopic ? `${currentTopic.progress.toFixed(1)} hours studied` : "No study data"}</li>
                    <li>{currentTopic ? `${currentTopic.session_count} sessions completed` : "No sessions"}</li>
                    <li>{currentTopic ? `${currentTopic.day_streak} day streak` : "No streak"}</li>
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
                    <span className="text-sm text-amber-700">
                      {topicProgress ? `${topicProgress.completed_lessons}/${topicProgress.total_lessons}` : "0/0"}
                    </span>
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                      initial={{ width: 0 }}
                      animate={{
                        width: topicProgress
                          ? `${(topicProgress.completed_lessons / topicProgress.total_lessons) * 100}%`
                          : "0%"
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Suggested Topics */}
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-amber-900 mb-3">Next Up</h4>
                  <div className="space-y-3">
                    {nextUpTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-md cursor-pointer transition-colors">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <div>
                          <p className="text-sm font-medium text-amber-900">{topic.name}</p>
                          <p className="text-xs text-amber-700">
                            {topic.completed_lessons}/{topic.total_lessons} lessons • {Math.round(topic.progress * 100)}% complete
                          </p>
                        </div>
                      </div>
                    ))}
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

        <NewTopicDialog
          isOpen={isNewTopicDialogOpen}
          onClose={() => setIsNewTopicDialogOpen(false)}
          onSubmit={() => { }}
        />
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
  const [improvementAreas, setImprovementAreas] = useState<ImprovementArea[]>([]);
  const [studyMetrics, setStudyMetrics] = useState<StudyMetric | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [hoveredSession, setHoveredSession] = useState<StudySession | null>(null);

  // Fetch data from API endpoints
  const fetchData = async (topicId?: number) => {
    try {
      const baseUrl = 'http://localhost:8000';
      const params = topicId ? `?topic_id=${topicId}` : '';

      const [improvementRes, metricsRes, sessionsRes] = await Promise.all([
        fetch(`${baseUrl}/api/improvement-areas${params}`),
        fetch(`${baseUrl}/api/study-metrics${params}`),
        fetch(`${baseUrl}/api/study-sessions${params}`)
      ]);

      if (!improvementRes.ok || !metricsRes.ok || !sessionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [improvement, metrics, sessions] = await Promise.all([
        improvementRes.json(),
        metricsRes.json(),
        sessionsRes.json()
      ]);

      setImprovementAreas(improvement);
      setStudyMetrics(metrics);
      setStudySessions(sessions);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set mock data for development
      setImprovementAreas([
        {
          lesson_id: 3,
          lesson_title: "Understand cosine",
          topic_name: "Trigonometry",
          progress: 0.45,
          missing_goals: 2
        },
        {
          lesson_id: 5,
          lesson_title: "Matrix multiplication",
          topic_name: "Linear Algebra",
          progress: 0.30,
          missing_goals: 1
        }
      ]);
      setStudyMetrics({
        topic_id: 1,
        topic_name: "Trigonometry",
        study_hours: 5.5,
        session_count: 7,
        day_streak: 3,
        overall_progress: 0.78
      });
      setStudySessions([
        {
          id: 101,
          topic_id: 1,
          lesson_id: 2,
          session_datetime: "2025-05-24T20:00:00",
          length_minutes: 45,
          mastery_score: 0.85
        },
        {
          id: 102,
          topic_id: 1,
          lesson_id: 3,
          session_datetime: "2025-05-23T18:30:00",
          length_minutes: 30,
          mastery_score: 0.75
        }
      ]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Listen for topic changes
  useEffect(() => {
    const handleTopicChange = (event: CustomEvent) => {
      const topicId = event.detail.topicId;
      if (topicId) {
        fetchData(topicId);
      }
    };

    window.addEventListener('topicChange', handleTopicChange as EventListener);
    return () => {
      window.removeEventListener('topicChange', handleTopicChange as EventListener);
    };
  }, []);

  const slides = [
    {
      title: "Study Goals",
      content: (
        <div className="space-y-3">
          {improvementAreas.map((area) => (
            <div key={area.lesson_id} className="p-3 bg-amber-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${area.progress >= 1 ? 'bg-green-500 border-green-600' : 'border-amber-400'}`}>
                    {area.progress >= 1 && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">{area.lesson_title}</h4>
                    <p className="text-sm text-amber-700">{area.topic_name}</p>
                  </div>
                </div>
                <span className="text-sm text-amber-700">
                  {area.progress >= 1 ? 'Complete' : `${Math.round(area.progress * 100)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Study Metrics",
      content: (
        <div className="space-y-3">
          {studyMetrics && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">{studyMetrics.topic_name}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-amber-700">
                  <span className="block font-medium">Progress</span>
                  <span>{studyMetrics.study_hours}h</span>
                </div>
                <div className="text-amber-700">
                  <span className="block font-medium">Sessions</span>
                  <span>{studyMetrics.session_count}</span>
                </div>
                <div className="text-amber-700">
                  <span className="block font-medium">Day Streak</span>
                  <span>{studyMetrics.day_streak} days</span>
                </div>
                <div className="text-amber-700">
                  <span className="block font-medium">Overall Progress</span>
                  <span>{Math.round(studyMetrics.overall_progress * 100)}%</span>
                </div>
              </div>
            </div>
          )}
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
                        const y1 = (1 - session.mastery_score) * 100;
                        const x2 = ((index + 1) / (studySessions.length - 1)) * 100;
                        const y2 = (1 - studySessions[index + 1].mastery_score) * 100;

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
                      const y = (1 - session.mastery_score) * 100;
                      const color = session.mastery_score >= 0.7 ? 'bg-green-500' :
                        session.mastery_score >= 0.4 ? 'bg-amber-500' :
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
                top: `${(1 - hoveredSession.mastery_score) * 100}%`
              }}
            >
              <p className="font-medium text-amber-900">Session {hoveredSession.id}</p>
              <p className="text-amber-700">Mastery: {Math.round(hoveredSession.mastery_score * 100)}%</p>
              <p className="text-amber-700">Duration: {hoveredSession.length_minutes} min</p>
              <p className="text-amber-700">{new Date(hoveredSession.session_datetime).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 50000);

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
            className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index ? 'bg-amber-600' : 'bg-amber-200'}`}
          />
        ))}
      </div>
    </div>
  );
}