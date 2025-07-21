import type { Story, StoryNode, Choice } from '../types';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Base API request function with error handling
 */
async function apiRequest<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any
): Promise<T> {
    // Get token from auth store
    const { token } = useAuthStore.getState();

    // Fallback to localStorage if token is not in state
    // This handles the case where the store might not be hydrated yet
    let authToken = token;
    if (!authToken) {
        try {
            const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            authToken = authStorage.state?.token || null;
        } catch (error) {
            // Silent fail - just continue with null token
        }
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
        method,
        headers,
        credentials: 'include',
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `API error: ${response.status}`;
        throw new Error(errorMessage);
    }

    return response.json();
}

/**
 * Story API functions
 */
export const storyApi = {
    // Get all published stories
    getPublishedStories: () =>
        apiRequest<{ status: string; data: { stories: Story[] } }>('/stories'),

    // Get stories by current user
    getMyStories: () =>
        apiRequest<{ status: string; data: { stories: Story[] } }>('/stories/my'),

    // Get story by ID
    getStoryById: (id: string) =>
        apiRequest<{ status: string; data: { story: Story } }>(`/stories/${id}`),

    // Create a new story
    createStory: (storyData: Partial<Story>) =>
        apiRequest<{ status: string; data: { story: Story } }>('/stories', 'POST', storyData),

    // Update a story
    updateStory: (id: string, storyData: Partial<Story>) =>
        apiRequest<{ status: string; data: { story: Story } }>(`/stories/${id}`, 'PUT', storyData),

    // Delete a story
    deleteStory: (id: string) =>
        apiRequest<void>(`/stories/${id}`, 'DELETE'),

    // Validate story structure before publishing
    validateStory: (id: string) =>
        apiRequest<{ status: string; data: { isValid: boolean; validationResult: any; message?: string } }>(`/stories/${id}/validate`, 'GET'),

    // Publish a story
    publishStory: (id: string, notes?: string) =>
        apiRequest<{ status: string; data: { story: Story } }>(`/stories/${id}/publish`, 'POST', { notes }),

    // Archive a story
    archiveStory: (id: string) =>
        apiRequest<{ status: string; data: { story: Story } }>(`/stories/${id}/archive`, 'POST'),
        
    // Node operations
    createNode: (storyId: string, nodeData: Partial<StoryNode>) =>
        apiRequest<{ status: string; data: { node: StoryNode } }>(`/stories/${storyId}/nodes`, 'POST', nodeData),
        
    updateNode: (nodeId: string, nodeData: Partial<StoryNode>) =>
        apiRequest<{ status: string; data: { node: StoryNode } }>(`/nodes/${nodeId}`, 'PUT', nodeData),
        
    deleteNode: (nodeId: string) =>
        apiRequest<void>(`/nodes/${nodeId}`, 'DELETE'),
        
    // Choice operations
    createChoice: (nodeId: string, choiceData: Partial<Choice>) =>
        apiRequest<{ status: string; data: { choice: Choice } }>(`/nodes/${nodeId}/choices`, 'POST', choiceData),
        
    updateChoice: (choiceId: string, choiceData: Partial<Choice>) =>
        apiRequest<{ status: string; data: { choice: Choice } }>(`/choices/${choiceId}`, 'PUT', choiceData),
        
    deleteChoice: (choiceId: string) =>
        apiRequest<void>(`/choices/${choiceId}`, 'DELETE')
};