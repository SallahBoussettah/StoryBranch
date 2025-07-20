// Story Types
export interface Story {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  nodes: StoryNode[];
  startNodeId: string;
}

export interface StoryNode {
  id: string;
  content: string;
  choices: Choice[];
  isEnding: boolean;
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

// Progress Types
export interface ReadingProgress {
  userId: string;
  storyId: string;
  currentNodeId: string;
  history: string[]; // Array of visited node IDs
  lastReadAt: Date;
}