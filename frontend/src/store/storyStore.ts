import { create } from 'zustand';
import type { Story, StoryNode, Choice } from '../types';
import { storyApi } from '../utils/api';

interface StoryState {
  stories: Story[];
  myStories: Story[];
  currentStory: Story | null;
  currentNode: StoryNode | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentStory: (story: Story) => void;
  setCurrentNode: (nodeId: string) => void;
  
  // API Actions
  fetchPublishedStories: () => Promise<Story[]>;
  fetchMyStories: () => Promise<Story[]>;
  fetchStoryById: (id: string) => Promise<Story | null>;
  createStory: (story: Partial<Story>) => Promise<Story | null>;
  updateStory: (storyId: string, updates: Partial<Story>) => Promise<Story | null>;
  deleteStory: (storyId: string) => Promise<boolean>;
  publishStory: (storyId: string, notes?: string) => Promise<Story | null>;
  archiveStory: (storyId: string) => Promise<Story | null>;
  
  // Node Actions
  createNode: (storyId: string, nodeData: Partial<StoryNode>) => Promise<StoryNode | null>;
  updateNode: (nodeId: string, nodeData: Partial<StoryNode>) => Promise<StoryNode | null>;
  deleteNode: (nodeId: string) => Promise<boolean>;
  
  // Choice Actions
  createChoice: (nodeId: string, choiceData: Partial<Choice>) => Promise<Choice | null>;
  updateChoice: (choiceId: string, choiceData: Partial<Choice>) => Promise<Choice | null>;
  deleteChoice: (choiceId: string) => Promise<boolean>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  myStories: [],
  currentStory: null,
  currentNode: null,
  isLoading: false,
  error: null,
  
  setCurrentStory: (story) => {
    set({ 
      currentStory: story,
      currentNode: story.nodes?.find(node => node.id === story.startNodeId) || null
    });
  },
  
  setCurrentNode: (nodeId) => {
    const { currentStory } = get();
    if (!currentStory || !currentStory.nodes) return;
    
    const node = currentStory.nodes.find(node => node.id === nodeId);
    if (node) {
      set({ currentNode: node });
    }
  },
  
  fetchPublishedStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.getPublishedStories();
      set({ stories: response.data.stories, isLoading: false });
      return response.data.stories;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch stories', isLoading: false });
      return [];
    }
  },
  
  fetchMyStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.getMyStories();
      set({ myStories: response.data.stories, isLoading: false });
      return response.data.stories;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch your stories', isLoading: false });
      return [];
    }
  },
  
  fetchStoryById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // First check if the story is in myStories (which means the user has permission)
      let { myStories } = get();
      
      // If myStories is empty, fetch them first
      if (myStories.length === 0) {
        try {
          const response = await storyApi.getMyStories();
          myStories = response.data.stories;
          set({ myStories });
        } catch (fetchError) {
          console.error('Failed to fetch user stories:', fetchError);
          // Continue with the empty array
        }
      }
      
      const existingStory = myStories.find(story => story.id === id);
      
      if (existingStory) {
        set({ isLoading: false });
        return existingStory;
      }
      
      // If not found in myStories, fetch it from the API
      const response = await storyApi.getStoryById(id);
      const story = response.data.story;
      set({ isLoading: false });
      return story;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch story', isLoading: false });
      return null;
    }
  },
  
  createStory: async (storyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.createStory(storyData);
      const newStory = response.data.story;
      set(state => ({ 
        myStories: [...state.myStories, newStory],
        isLoading: false 
      }));
      return newStory;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create story', isLoading: false });
      return null;
    }
  },
  
  updateStory: async (storyId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.updateStory(storyId, updates);
      const updatedStory = response.data.story;
      
      set(state => ({
        myStories: state.myStories.map(story => 
          story.id === storyId ? updatedStory : story
        ),
        stories: state.stories.map(story => 
          story.id === storyId ? updatedStory : story
        ),
        currentStory: state.currentStory?.id === storyId ? updatedStory : state.currentStory,
        isLoading: false
      }));
      
      return updatedStory;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update story', isLoading: false });
      return null;
    }
  },
  
  deleteStory: async (storyId) => {
    set({ isLoading: true, error: null });
    try {
      await storyApi.deleteStory(storyId);
      
      set(state => ({
        myStories: state.myStories.filter(story => story.id !== storyId),
        stories: state.stories.filter(story => story.id !== storyId),
        currentStory: state.currentStory?.id === storyId ? null : state.currentStory,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete story', isLoading: false });
      return false;
    }
  },
  
  publishStory: async (storyId, notes) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.publishStory(storyId, notes);
      const publishedStory = response.data.story;
      
      set(state => ({
        myStories: state.myStories.map(story => 
          story.id === storyId ? publishedStory : story
        ),
        stories: [...state.stories, publishedStory],
        currentStory: state.currentStory?.id === storyId ? publishedStory : state.currentStory,
        isLoading: false
      }));
      
      return publishedStory;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to publish story', isLoading: false });
      return null;
    }
  },
  
  archiveStory: async (storyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.archiveStory(storyId);
      const archivedStory = response.data.story;
      
      set(state => ({
        myStories: state.myStories.map(story => 
          story.id === storyId ? archivedStory : story
        ),
        stories: state.stories.filter(story => story.id !== storyId),
        currentStory: state.currentStory?.id === storyId ? archivedStory : state.currentStory,
        isLoading: false
      }));
      
      return archivedStory;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to archive story', isLoading: false });
      return null;
    }
  },
  
  // Node Actions
  createNode: async (storyId, nodeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.createNode(storyId, nodeData);
      const newNode = response.data.node;
      
      // Update the current story if it matches
      set(state => {
        if (state.currentStory && state.currentStory.id === storyId) {
          return {
            currentStory: {
              ...state.currentStory,
              nodes: [...state.currentStory.nodes, newNode]
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      
      return newNode;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create node', isLoading: false });
      return null;
    }
  },
  
  updateNode: async (nodeId, nodeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.updateNode(nodeId, nodeData);
      const updatedNode = response.data.node;
      
      // Update the current story if it contains this node
      set(state => {
        if (state.currentStory && state.currentStory.nodes.some(node => node.id === nodeId)) {
          return {
            currentStory: {
              ...state.currentStory,
              nodes: state.currentStory.nodes.map(node => 
                node.id === nodeId ? updatedNode : node
              )
            },
            currentNode: state.currentNode?.id === nodeId ? updatedNode : state.currentNode,
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      
      return updatedNode;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update node', isLoading: false });
      return null;
    }
  },
  
  deleteNode: async (nodeId) => {
    set({ isLoading: true, error: null });
    try {
      await storyApi.deleteNode(nodeId);
      
      // Update the current story if it contains this node
      set(state => {
        if (state.currentStory && state.currentStory.nodes.some(node => node.id === nodeId)) {
          // Remove the node
          const updatedNodes = state.currentStory.nodes.filter(node => node.id !== nodeId);
          
          // Remove any choices that point to this node
          const updatedNodesWithFixedChoices = updatedNodes.map(node => ({
            ...node,
            choices: node.choices.filter(choice => choice.targetNodeId !== nodeId)
          }));
          
          return {
            currentStory: {
              ...state.currentStory,
              nodes: updatedNodesWithFixedChoices,
              // If this was the start node, we need to update that too
              startNodeId: state.currentStory.startNodeId === nodeId 
                ? (updatedNodesWithFixedChoices.length > 0 ? updatedNodesWithFixedChoices[0].id : undefined) 
                : state.currentStory.startNodeId
            },
            currentNode: state.currentNode?.id === nodeId ? null : state.currentNode,
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete node', isLoading: false });
      return false;
    }
  },
  
  // Choice Actions
  createChoice: async (nodeId, choiceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.createChoice(nodeId, choiceData);
      const newChoice = response.data.choice;
      
      // Update the current story if it contains the source node
      set(state => {
        if (state.currentStory) {
          const updatedNodes = state.currentStory.nodes.map(node => {
            if (node.id === nodeId) {
              return {
                ...node,
                choices: [...node.choices, newChoice]
              };
            }
            return node;
          });
          
          return {
            currentStory: {
              ...state.currentStory,
              nodes: updatedNodes
            },
            currentNode: state.currentNode?.id === nodeId 
              ? { ...state.currentNode, choices: [...state.currentNode.choices, newChoice] } 
              : state.currentNode,
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      
      return newChoice;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create choice', isLoading: false });
      return null;
    }
  },
  
  updateChoice: async (choiceId, choiceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await storyApi.updateChoice(choiceId, choiceData);
      const updatedChoice = response.data.choice;
      
      // Update the current story if it contains this choice
      set(state => {
        if (state.currentStory) {
          const updatedNodes = state.currentStory.nodes.map(node => {
            const choiceIndex = node.choices.findIndex(choice => choice.id === choiceId);
            if (choiceIndex !== -1) {
              return {
                ...node,
                choices: [
                  ...node.choices.slice(0, choiceIndex),
                  updatedChoice,
                  ...node.choices.slice(choiceIndex + 1)
                ]
              };
            }
            return node;
          });
          
          // Also update currentNode if needed
          let updatedCurrentNode = state.currentNode;
          if (state.currentNode) {
            const choiceIndex = state.currentNode.choices.findIndex(choice => choice.id === choiceId);
            if (choiceIndex !== -1) {
              updatedCurrentNode = {
                ...state.currentNode,
                choices: [
                  ...state.currentNode.choices.slice(0, choiceIndex),
                  updatedChoice,
                  ...state.currentNode.choices.slice(choiceIndex + 1)
                ]
              };
            }
          }
          
          return {
            currentStory: {
              ...state.currentStory,
              nodes: updatedNodes
            },
            currentNode: updatedCurrentNode,
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      
      return updatedChoice;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update choice', isLoading: false });
      return null;
    }
  },
  
  deleteChoice: async (choiceId) => {
    set({ isLoading: true, error: null });
    try {
      await storyApi.deleteChoice(choiceId);
      
      // Update the current story if it contains this choice
      set(state => {
        if (state.currentStory) {
          const updatedNodes = state.currentStory.nodes.map(node => {
            const hasChoice = node.choices.some(choice => choice.id === choiceId);
            if (hasChoice) {
              return {
                ...node,
                choices: node.choices.filter(choice => choice.id !== choiceId)
              };
            }
            return node;
          });
          
          // Also update currentNode if needed
          let updatedCurrentNode = state.currentNode;
          if (state.currentNode && state.currentNode.choices.some(choice => choice.id === choiceId)) {
            updatedCurrentNode = {
              ...state.currentNode,
              choices: state.currentNode.choices.filter(choice => choice.id !== choiceId)
            };
          }
          
          return {
            currentStory: {
              ...state.currentStory,
              nodes: updatedNodes
            },
            currentNode: updatedCurrentNode,
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete choice', isLoading: false });
      return false;
    }
  }
}));