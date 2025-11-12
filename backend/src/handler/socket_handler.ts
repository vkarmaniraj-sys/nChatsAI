const userSockets = new Map(); // Map<userId, socket>

export const addUserSocket = (userId: any, socket: any) =>
  userSockets.set(userId, socket);
export const removeUserSocket = (userId: any) => userSockets.delete(userId);
export const getSocketByUserId = (userId: any) => userSockets.get(userId);
export const getAllUserSockets = () => [...userSockets.entries()];
