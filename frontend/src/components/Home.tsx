import { useContext, useEffect, useState, useRef } from "react";
import { SendInputText } from "../services/InputData_Controller_service";
import Header from "./header";
import { formatOutput } from "../services/outPutformater_service";


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "./home.css";
import ThemeContext from "./themeProvider";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
// import { useNavigate } from "react-router-dom";

import { DeleteSessionMemoryWithSessionId, GetCurrentActiveSession, GetSessionMemories, GetSessionMemoryWithSessionId, SetNewSessionInHTTP } from "../services/sessionMemory_service";
import { getSocket, switchSession } from "../services/socket_service";

interface SessionMemory {
    _id: string;
    Title: string;
    Sessionid: string;
    // Add other properties if needed
}

const HomeData = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [inputvalue, setInputvalue] = useState("");
    const [outputValue, setOutPutValue] = useState("");
    const [selectedModel, setSelectedModel] = useState("deepseek");
    const [messages, setMessages] = useState<{ role: 'user' | 'system' | 'assistant'; content: string }[]>([]);
    const [rawSystemText, setRawSystemText] = useState(""); // hold raw unformatted stream
    const [sessionMemories, setsessionnMemories] = useState([]);
    const [ActiveSession, setActiveSession] = useState(null);

    // const useroute = useRouter();

    const hasRun = useRef(false);

    const location = useLocation();
    const navigate = useNavigate();
    const Sessionid = useParams();

    const [height, setHeight] = useState("40px");
    const [newChat, setNewChat] = useState(false);

    const listener = async (msg: { message: string }) => {
        const incoming = msg.message;  // incoming chunk, e.g., "Hello"
        //replace(/\\n|\n/g, "");
        console.log("incoming message", incoming);
        // 1. Append incoming chunk to raw system text
        setRawSystemText(prevRaw => prevRaw + incoming);

        // 2. Format just this chunk and append it to the last message
        const formatted = await formatOutput(incoming); // format only current chunk

        console.log("formatted string",formatted);

        setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];

            if (last?.role === 'system') {
                updated[updated.length - 1] = {
                    ...last,
                    content: last.content + formatted // append the chunk
                };
            }
            return updated;
        });
    };

    useEffect(() => {
        console.log("SessionId:", Sessionid);

        if (Sessionid.Sessionid) {
            console.log("Test Current SessionId:", Sessionid.Sessionid);
            fetchSessionData(Sessionid.Sessionid);
        } else {
            (async () => {
                // const CSession = uuidv4();
                // const httpsocketchange = await SetNewSessionInHTTP(CSession);
                // console.log("httpsocketchange", httpsocketchange);
                // await switchSession(CSession);
                getActiveSession();
                getSessionMemoryWithId();
            })();
        }
    }, []);

    useEffect(() => {
        setOutPutValue("");
        console.log("RawSystemText",rawSystemText);
        getSocket().on("live-data", listener);

        return () => {
            getSocket().off("live-data", listener);
        };
    }, []);

    useEffect(() => {

        console.log("messages",messages);
    }, [messages])

    async function getActiveSession() {
        const currentseesion = await GetCurrentActiveSession();
        console.log("yes Current Session", currentseesion);
        setActiveSession(currentseesion.sessionId);
    }


    function handleSend() {

        console.log("CurentLocation", location.pathname);
        const regex = /^\/c\/[A-Za-z0-9-]+$/;
        if (!regex.test(location.pathname)) {
            console.log("New Chat");
            setNewChat(true);
        } else {
            setNewChat(false);
        }
        console.log("inputValue before", inputvalue);
        if (inputvalue.trim() === '') return;
        setMessages(prev => [...prev, { role: 'user', content: inputvalue }]);
        console.log("inputValue after", inputvalue);
        setHeight("40px");
        SendInputText(inputvalue, selectedModel);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'system', content: outputValue }]);
        });
        setInputvalue('');

        setRawSystemText("");
    }

    async function getSessionMemoryWithId() {

        const FoundMemory = await GetSessionMemories();

        console.log("currentsession", ActiveSession);
        if (ActiveSession != "" && ActiveSession) {
            navigate("/c/" + ActiveSession);
        }
        console.log("FoundMemory", FoundMemory);
        setsessionnMemories(FoundMemory.data.FoundMemory);
    }

    async function fetchSessionData(id: string) {

        navigate("/c/" + id);
        const httpsocketchange = await SetNewSessionInHTTP(id);
        console.log("httpsocketchange", httpsocketchange);
        await switchSession(id);

        getActiveSession();
        console.log("Test Current SessionId:", id);
        const Memorydata = await GetSessionMemoryWithSessionId({ Sessionid: id });
        console.log("MemoryData", Memorydata.data.FoundMemory[0].Messages);
        setMessages(Memorydata.data.FoundMemory[0].Messages);
    }

    async function NewChat() {
        navigate("/");
        // window.location.reload();
        const CSession = uuidv4();
        console.log("New generated Session", CSession);
        const httpsocketchange = await SetNewSessionInHTTP(CSession);
        console.log("httpsocketchange", httpsocketchange);
        await switchSession(CSession);
        getActiveSession();
        getSessionMemoryWithId();
        setMessages([]);
    }

    return <>
        <div className={`h-screen w-screen flex flex-col ${theme === "dark" ? "dark-theme" : ""
            }`} style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
            }}>
            <Header />
            <div className="flex flex-1 h-[90vh]">
                <div className={`w-64 flex flex-col justify-between border-r p-4`} style={{ "gap": "10px" }}>
                    {/* Sidebar content */}
                    <div>
                        <button className=" bg-gray-50" onClick={async () => { await NewChat() }}>New Chat</button>
                    </div>
                    <div className="overflow-y-auto h-full">
                        {(ActiveSession != "" && ActiveSession) && <h2>{ActiveSession}</h2>}
                        {(ActiveSession != "" && ActiveSession) && sessionMemories.map((value: SessionMemory) => (
                            <div>
                                <div className={`flex flex-row justify-between ${value.Sessionid == ActiveSession ? "bg-[#80808078] rounded-[10px]" : ""}`}>
                                    <h3
                                        key={value.Sessionid}
                                        className="p-2 rounded hover:bg-gray-100 cursor-pointer"
                                        onClick={async () => {
                                            await fetchSessionData(value.Sessionid)
                                        }}
                                    >
                                        {value.Title}
                                    </h3>
                                    <button
                                        className="p-0 bg-transparent"
                                        onClick={async () => {
                                            await DeleteSessionMemoryWithSessionId({ Sessionid: value.Sessionid });
                                            await getSessionMemoryWithId()
                                        }}
                                    >
                                        <FaTrash size={16} /> {/* Adjust size as needed */}
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Settings */}

                    <div className={`flex items-center gap-2 text-gray-600 cursor-pointer hover:text-black mt-4 ${theme === "dark" ? "dark-theme" : ""
                        }`} style={{
                            color: "var(--text-color)",
                        }} >
                        <span>Settings</span>
                        <button onClick={toggleTheme}>Change Theme</button>
                    </div>
                </div>
                {/* Chat area */}
                <div className="flex flex-col justify-between w-full max-w-4xl px-4 py-6" style={{ flexGrow: 1, overflowY: 'scroll', scrollBehavior: 'smooth', scrollbarWidth: 'none', maxWidth: "80%" }}>

                    {/* Messages */}
                    <div className="flex flex-col gap-4 overflow-y-auto flex-1 px-2" style={{ maxHeight: '70vh' }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`px-4 py-3 rounded-2xl max-w-[70%] text-sm 
                                    ${msg?.role === 'user' ? 'bg-green-100 text-green-800 whitespace-pre-wrap font-mono' : 'bg-gray-200 text-gray-800 System-chat'}`}
                                >

                                    {<ReactMarkdown remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Make sure code blocks and inline code use monospace font and preserve spacing
                                            pre: ({ ...props }) => (
                                                <pre {...props} className="whitespace-pre-wrap font-mono" />
                                            ),
                                            code: ({ ...props }) => (
                                                <code {...props} className="whitespace-pre-wrap font-mono" />
                                            ),
                                            p: ({ ...props }) => (
                                                <p {...props} className="whitespace-pre-wrap font-mono" />
                                            )
                                        }}
                                    >
                                        {String(msg?.content || "")}
                                    </ReactMarkdown>}
                                </div>
                            </div>
                        ))}

                        {!messages.length && (
                            <div className="flex justify-center text-blue-400 text-xl font-semibold mt-8">
                                Hello! How can I help you today?
                            </div>
                        )}
                    </div>


                    {/* Input area */}
                    <div className="mt-4 flex items-center justify-between border-t pt-4 gap-4">
                        {/* Select model */}
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded-md text-sm"
                        >
                            <option value="deepseek">DeepSeek</option>
                            <option value="gemini">Gemini</option>
                        </select>

                        {/* Input box */}
                        <textarea
                            value={inputvalue}
                            onChange={(e) => {
                                console.log("e.target.value", e.target.value);
                                setInputvalue(e.target.value);
                                setHeight("40px"); // reset first
                                setHeight(`${e.target.scrollHeight}px`); // then grow
                            }}
                            style={{ height }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none resize-none max-h-35"
                        />

                        {/* Button */}
                        <button
                            onClick={handleSend}
                            className="bg-black hover:bg-gray-900 text-black px-5 py-2 rounded-md text-sm font-semibold"
                        >
                            Let's go!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default HomeData;