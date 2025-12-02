import { io } from "socket.io-client";


const BackendLink = import.meta.env.VITE_API_BackendBaseUrl;

let socket = io(BackendLink, { withCredentials: true });



export function getSocket() {
  return socket;
}

socket.on('connect', () => {
  console.log('Connected to server with socket ID:', socket.id);
  // Optionally fetch session list or current session on connect
});

socket.on('session-error', (data: { message: string }) => {
  console.error('Session error:', data.message);
  // Update UI with error if needed
});

socket.on('session-updated', (data: { sessionID: string; message: string }) => {
  console.log('Session updated:', data.message, data.sessionID);
  // Update UI with new session ID
});

socket.on('current-session', (data: { sessionID: string }) => {
  console.log('Current session:', data.sessionID);
  // Update UI with current session ID
});

// Switch to a new session (random or custom ID)


export async function switchSession(newSessionId?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Ensure socket is connected
    if (!socket.connected) {
      socket = io(BackendLink, { withCredentials: true });
    }
   

    // Temporary event handlers
    const onSessionUpdated = (data: { sessionID: string; message: string }) => {
      socket.off('session-updated', onSessionUpdated);
      socket.off('session-error', onSessionError);
      resolve(`${data.message}: ${data.sessionID}`);
    };

    const onSessionError = (data: { message: string }) => {
      socket.off('session-updated', onSessionUpdated);
      socket.off('session-error', onSessionError);
      reject(new Error(data.message));
    };

    // Add temporary listeners
    socket.on('session-updated', onSessionUpdated);
    socket.on('session-error', onSessionError);

    // Emit appropriate event
    if (newSessionId) {
      socket.emit('create-custom-session', { sessionID: newSessionId });
    } else {
      socket.emit('create-random-session');
    }
  });
}

// Get the current active session ID
export async function getActiveSession(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Ensure socket is connected
    if (!socket.connected) {
      socket = io(BackendLink, { withCredentials: true });
    }

    // Temporary event handlers
    const onCurrentSession = (data: { sessionID: string }) => {
      socket.off('current-session', onCurrentSession);
      socket.off('session-error', onSessionError);
      resolve(data.sessionID);
    };

    const onSessionError = (data: { message: string }) => {
      socket.off('current-session', onCurrentSession);
      socket.off('session-error', onSessionError);
      reject(new Error(data.message));
    };

    // Add temporary listeners
    socket.on('current-session', onCurrentSession);
    socket.on('session-error', onSessionError);

    // Request current session
    socket.emit('get-current-session');
  });
}