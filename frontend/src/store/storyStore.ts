import { create } from 'zustand';
import type { Story, StoryNode } from '../types';

interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  currentNode: StoryNode | null;
  
  // Actions
  setCurrentStory: (story: Story) => void;
  setCurrentNode: (nodeId: string) => void;
  
  // Placeholder functions - will be implemented in future tasks
  fetchStories: () => Promise<void>;
  createStory: (story: Partial<Story>) => Promise<void>;
  updateStory: (storyId: string, updates: Partial<Story>) => Promise<void>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  currentStory: null,
  currentNode: null,
  
  setCurrentStory: (story) => {
    set({ 
      currentStory: story,
      currentNode: story.nodes.find(node => node.id === story.startNodeId) || null
    });
  },
  
  setCurrentNode: (nodeId) => {
    const { currentStory } = get();
    if (!currentStory) return;
    
    const node = currentStory.nodes.find(node => node.id === nodeId);
    if (node) {
      set({ currentNode: node });
    }
  },
  
  // Placeholder implementations - will be properly implemented in future tasks
  fetchStories: async () => {
    // This will be implemented when we add API integration
    console.log('Fetching stories...');
  },
  
  createStory: async (story) => {
    // This will be implemented when we add API integration
    console.log('Creating story:', story);
  },
  
  updateStory: async (storyId, updates) => {
    // This will be implemented when we add API integration
    console.log('Updating story:', storyId, updates);
  }
}));