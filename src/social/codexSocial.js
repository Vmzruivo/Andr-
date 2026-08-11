export const createProfile = ({ id, name = "Aventureiro", avatar = null }) => ({
  id,
  name,
  avatar,
  level: 1,
  totalXP: 0,
  questsCompletedEver: 0,
  maxStreakEver: 0,
  usageSeconds: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const createPost = ({ authorId, text, achievementId = null }) => ({
  id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  authorId,
  text: text.trim(),
  achievementId,
  createdAt: Date.now(),
  likesCount: 0,
  commentsCount: 0,
});

export const createConversation = (participantIds) => ({
  id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  participantIds: [...new Set(participantIds)],
  updatedAt: Date.now(),
});

export const createMessage = ({ conversationId, senderId, text }) => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  conversationId,
  senderId,
  text: text.trim(),
  createdAt: Date.now(),
  readAt: null,
});

export const sortByNewest = (items) => [...items].sort((a, b) => b.createdAt - a.createdAt);

export const sortLeaderboard = (users, mode = "level") => [...users].sort((a, b) => {
  if (mode === "time") return (b.usageSeconds || 0) - (a.usageSeconds || 0);
  return (b.level || 1) - (a.level || 1) || (b.totalXP || 0) - (a.totalXP || 0);
});

export const canAccessConversation = (conversation, userId) =>
  Boolean(conversation?.participantIds?.includes(userId));
