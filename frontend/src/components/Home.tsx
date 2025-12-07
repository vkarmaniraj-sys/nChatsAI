// HomeData.tsx
import { useContext, useEffect, useState } from "react";
import { SendInputText } from "../services/InputData_Controller_service";
import Header from "./header";
import { formatOutput } from "../services/outPutformater_service";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./home.css";
import ThemeContext from "./themeProvider";

import { useParams, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

import {
  DeleteSessionMemoryWithSessionId,
  GetCurrentActiveSession,
  GetSessionMemories,
  GetSessionMemoryWithSessionId,
  SetNewSessionInHTTP,
} from "../services/sessionMemory_service";

import { getSocket, switchSession } from "../services/socket_service";

interface SessionMemory {
  _id: string;
  Title: string;
  Sessionid: string;
}

const HomeData = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [inputvalue, setInputvalue] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek");

  const [messages, setMessages] = useState<
    { role: "user" | "system" | "assistant"; content: string }[]
  >([]);

//   const [_, setRawSystemText] = useState("");

  const [sessionMemories, setsessionnMemories] = useState<SessionMemory[]>([]);
  const [ActiveSession, setActiveSession] = useState<string | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
//   const location = useLocation();

  const [height, setHeight] = useState("40px");

  //-------------------------------------------------------------
  // SOCKET LISTENER
  //-------------------------------------------------------------
  const listener = async (msg: { message: string }) => {
    const incoming = msg.message;

    // setRawSystemText((prev) => prev + incoming);

    const formatted = await formatOutput(incoming);

    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];

      if (last?.role === "system") {
        updated[updated.length - 1] = {
          ...last,
          content: last.content + formatted,
        };
      }
      return updated;
    });
  };

  //-------------------------------------------------------------
  // BOOTSTRAP LOGIC
  //-------------------------------------------------------------
  useEffect(() => {
    getSocket().on("live-data", listener);
    return () => {
      getSocket().off("live-data", listener);
    };
  }, []);

  //-------------------------------------------------------------
  // LOAD SESSION OR CREATE NEW
  //-------------------------------------------------------------
  useEffect(() => {
    if (params.Sessionid) {
      fetchSessionData(params.Sessionid);
    } else {
      initializeNewOrExistingSession();
    }
  }, []);

  const initializeNewOrExistingSession = async () => {
    await getActiveSession();
    await loadAllSessions();
  };

  //-------------------------------------------------------------
  // SESSION FUNCTIONS
  //-------------------------------------------------------------
  async function getActiveSession() {
    const data = await GetCurrentActiveSession();
    setActiveSession(data.sessionId);
  }

  async function loadAllSessions() {
    const FoundMemory = await GetSessionMemories();
    setsessionnMemories(FoundMemory.data.FoundMemory);

    if (ActiveSession) {
      navigate(`/c/${ActiveSession}`);
    }
  }

  async function fetchSessionData(id: string) {
    navigate(`/c/${id}`);

    await SetNewSessionInHTTP(id);
    await switchSession(id);

    await getActiveSession();

    const Memorydata = await GetSessionMemoryWithSessionId({ Sessionid: id });
    setMessages(Memorydata.data.FoundMemory[0]?.Messages || []);
  }

  async function NewChat() {
    navigate("/");

    const newId = uuidv4();

    await SetNewSessionInHTTP(newId);
    await switchSession(newId);

    await getActiveSession();
    await loadAllSessions();

    setMessages([]);
  }

  //-------------------------------------------------------------
  // SEND MESSAGE
  //-------------------------------------------------------------
  function handleSend() {
    if (!inputvalue.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputvalue }]);

    setMessages((prev) => [...prev, { role: "system", content: "" }]);

    SendInputText(inputvalue, selectedModel);

    setInputvalue("");
    // setRawSystemText("");
    setHeight("40px");
  }

  //-------------------------------------------------------------
  // RENDER
  //-------------------------------------------------------------
  return (
    <>
      <div
        className={`min-h-screen w-full flex flex-col ${
          theme === "dark" ? "dark-theme" : ""
        }`}
        style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
      >
        {/* MOBILE HAMBURGER */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5"
            />
          </svg>
        </button>

        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR - MOBILE */}
          <div
            className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50
              transform transition-transform duration-300 sm:hidden
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileSidebarOpen(false)}>
                ✕
              </button>
            </div>

            <SidebarContent
              ActiveSession={ActiveSession}
              sessionMemories={sessionMemories}
              NewChat={NewChat}
              fetchSessionData={fetchSessionData}
              toggleTheme={toggleTheme}
              closeSidebar={() => setMobileSidebarOpen(false)}
            />
          </div>

          {/* SIDEBAR - DESKTOP */}
          <div className="hidden sm:flex flex-col w-64 bg-white dark:bg-gray-900 border-r overflow-y-auto">
            <SidebarContent
              ActiveSession={ActiveSession}
              sessionMemories={sessionMemories}
              NewChat={NewChat}
              fetchSessionData={fetchSessionData}
              toggleTheme={toggleTheme}
            />
          </div>

          {/* CHAT AREA */}
          <div className="flex flex-col justify-between flex-1 px-3 py-4 overflow-hidden">
            {/* MESSAGES */}
            <div
              className="flex flex-col gap-4 overflow-y-auto flex-1 px-1"
              style={{ maxHeight: "70vh" }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[80%] md:max-w-[70%] text-sm ${
                      msg.role === "user"
                        ? "bg-green-100 text-green-800 font-mono"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre: (props) => (
                          <pre {...props} className="whitespace-pre-wrap font-mono" />
                        ),
                        code: (props) => (
                          <code {...props} className="whitespace-pre-wrap font-mono" />
                        ),
                        p: (props) => (
                          <p {...props} className="whitespace-pre-wrap font-mono" />
                        ),
                      }}
                    >
                      {String(msg.content || "")}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {!messages.length && (
                <div className="flex justify-center text-blue-400 text-xl font-semibold mt-8">
                  Hello! How can I help you today?
                </div>
              )}
            </div>

            {/* INPUT AREA */}
            <div className="mt-4 flex items-center gap-3 border-t pt-4">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="gemini">Gemini</option>
              </select>

              <textarea
                value={inputvalue}
                onChange={(e) => {
                  setInputvalue(e.target.value);
                  setHeight("40px");
                  setHeight(`${e.target.scrollHeight}px`);
                }}
                style={{ height }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none resize-none max-h-32"
              />

              <button
                onClick={handleSend}
                className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-md text-sm font-semibold"
              >
                Let’s go!
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeData;

// Reusable Sidebar Content
interface SidebarContentProps {
  ActiveSession: string | null;
  sessionMemories: SessionMemory[];
  NewChat: () => Promise<void>;
  fetchSessionData: (id: string) => Promise<void>;
  toggleTheme: () => void;
  closeSidebar?: () => void;
}

const SidebarContent = ({
  ActiveSession,
  sessionMemories,
  NewChat,
  fetchSessionData,
  toggleTheme,
  closeSidebar,
}: SidebarContentProps) => {
  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <button
        className="bg-gray-100 dark:bg-gray-700 w-full p-2 rounded"
        onClick={async () => {
          await NewChat();
          closeSidebar?.();
        }}
      >
        New Chat
      </button>

      {ActiveSession && <h2 className="font-semibold">{ActiveSession}</h2>}

      {ActiveSession &&
        sessionMemories.map((value: SessionMemory) => (
          <div
            key={value.Sessionid}
            className={`flex justify-between p-2 rounded cursor-pointer ${
              value.Sessionid === ActiveSession
                ? "bg-gray-300 dark:bg-gray-700"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            onClick={async () => {
              await fetchSessionData(value.Sessionid);
              closeSidebar?.();
            }}
          >
            <span>{value.Title}</span>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                await DeleteSessionMemoryWithSessionId({
                  Sessionid: value.Sessionid,
                });
              }}
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}

      <div className="mt-auto flex justify-between items-center">
        <span>Settings</span>
        <button onClick={toggleTheme}>Theme</button>
      </div>
    </div>
  );
};
