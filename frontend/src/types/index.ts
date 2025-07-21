// Story Types
export type StoryStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Story {
  id: string;
  authorId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  genres: string[];
  difficulty: Difficulty;
  status: StoryStatus;
  metadata: Record<string, any>;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  nodes: StoryNode[];
  startNodeId?: string;
}

export interface StoryNode {
  id: string;
  storyId: string;
  title: string;
  content: string;
  isEnding: boolean;
  metadata: Record<string, any>;
  positionX: number;
  positionY: number;
  choices: Choice[];
}

export interface Choice {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  text: string;
  order: number;
  conditions: Record<string, any>;
}

// User Types
export type UserRole = 'READER' | 'WRITER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Progress Types
export interface ReadingProgress {
  id: string;
  userId: string;
  storyId: string;
  currentNodeId: string;
  visitedNodes: string[]; // Array of visited node IDs
  discoveredEndings: string[]; // Array of discovered ending node IDs
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
}

// Achievement Types
export type AchievementType = 'STORY_COMPLETION' | 'ENDING_DISCOVERY' | 'SPECIAL_PATH' | 'SYSTEM';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  type: AchievementType;
  criteria: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  storyId?: string;
  earnedAt: Date;
  achievement: Achievement;
}