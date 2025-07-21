import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoryStore } from '../store/storyStore';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import NodeEditor from '../components/story/editor/NodeEditor';
import GraphEditor from '../components/story/editor/GraphEditor';
import EditorToolbar from '../components/story/editor/EditorToolbar';
import type { Story, StoryNode, Choice } from '../types';

// Enum for editor views
enum EditorView {
  GRAPH = 'graph',
  NODE = 'node',
  PREVIEW = 'preview',
}

const StoryEditor: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { fetchStoryById, updateStory, isLoading, error } = useStoryStore();

  const [story, setStory] = useState<Story | null>(null);
  const [currentView, setCurrentView] = useState<EditorView>(EditorView.GRAPH);
  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Fetch story data
  useEffect(() => {
    if (!storyId) {
      navigate('/stories/manage');
      return;
    }

    // Store the current story ID in sessionStorage to persist across page refreshes
    sessionStorage.setItem('currentEditingStoryId', storyId);

    const loadStory = async () => {
      try {
        // First try to fetch the user's stories to ensure we have them in the store
        await useStoryStore.getState().fetchMyStories();

        // Then fetch the specific story
        const fetchedStory = await fetchStoryById(storyId);
        if (fetchedStory) {
          setStory(fetchedStory);
          // If no nodes exist yet, we'll need to create a start node
          if (!fetchedStory.nodes || fetchedStory.nodes.length === 0) {
            const startNode: StoryNode = {
              id: 'temp-start-node-id', // Will be replaced by backend
              storyId: fetchedStory.id,
              title: 'Start',
              content: 'This is the beginning of your story.',
              isEnding: false,
              metadata: { isStart: true },
              positionX: 250,
              positionY: 100,
              choices: [],
            };
            setStory({
              ...fetchedStory,
              nodes: [startNode],
              startNodeId: 'temp-start-node-id',
            });
          }
        }
      } catch (error) {
        console.error('Error loading story:', error);
        // Error will be handled by the error state in the store
      }
    };

    loadStory();
  }, [storyId, fetchStoryById, navigate]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: StoryNode) => {
    setSelectedNode(node);
    setCurrentView(EditorView.NODE);
  }, []);

  // Debounced save function
  const handleSave = useCallback(async () => {
    if (!story || !storyId) return;

    setIsSaving(true);
    setSaveMessage('Saving...');

    try {
      await updateStory(storyId, story);
      setSaveMessage('Saved');

      // Clear the message after a delay
      setTimeout(() => {
        setSaveMessage(null);
      }, 2000);
    } catch (error) {
      setSaveMessage('Error saving');
      console.error('Failed to save story:', error);
    } finally {
      setIsSaving(false);
    }
  }, [story, storyId, updateStory]);

  // Handle node update
  const handleNodeUpdate = useCallback((updatedNode: StoryNode) => {
    if (!story) return;

    const updatedNodes = story.nodes.map(node =>
      node.id === updatedNode.id ? updatedNode : node
    );

    setStory({
      ...story,
      nodes: updatedNodes,
    });

    // Auto-save after node update
    handleSave();
  }, [story, handleSave]);

  // Handle node creation
  const handleNodeCreate = useCallback((position: { x: number, y: number }) => {
    if (!story) return;

    const newNode: StoryNode = {
      id: `temp-node-${Date.now()}`, // Will be replaced by backend
      storyId: story.id,
      title: 'New Node',
      content: '',
      isEnding: false,
      metadata: {},
      positionX: position.x,
      positionY: position.y,
      choices: [],
    };

    setStory(prevStory => {
      if (!prevStory) return null;
      return {
        ...prevStory,
        nodes: [...prevStory.nodes, newNode],
      };
    });

    // Don't automatically select the new node for editing
    // Just save it to the backend
    setTimeout(() => {
      if (story) {
        updateStory(storyId!, {
          ...story,
          nodes: [...story.nodes, newNode]
        });
      }
    }, 0);
  }, [story, storyId, updateStory]);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId: string) => {
    if (!story) return;

    // Cannot delete start node
    if (nodeId === story.startNodeId) {
      alert('Cannot delete the start node.');
      return;
    }

    // Remove the node
    const updatedNodes = story.nodes.filter(node => node.id !== nodeId);

    // Remove any choices that point to this node
    const updatedNodesWithFixedChoices = updatedNodes.map(node => ({
      ...node,
      choices: node.choices.filter(choice => choice.targetNodeId !== nodeId),
    }));

    setStory({
      ...story,
      nodes: updatedNodesWithFixedChoices,
    });

    // If the deleted node was selected, clear selection
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setCurrentView(EditorView.GRAPH);
    }

    // Auto-save after node deletion
    handleSave();
  }, [story, selectedNode, handleSave]);

  // Handle connection (choice) creation
  const handleConnectionCreate = useCallback((sourceNodeId: string, targetNodeId: string) => {
    if (!story) return;

    // Find the source node
    const sourceNode = story.nodes.find(node => node.id === sourceNodeId);
    if (!sourceNode) return;

    // Check if connection already exists
    const connectionExists = sourceNode.choices.some(choice =>
      choice.sourceNodeId === sourceNodeId && choice.targetNodeId === targetNodeId
    );

    if (connectionExists) return;

    // Create a new choice
    const newChoice: Choice = {
      id: `temp-choice-${Date.now()}`, // Will be replaced by backend
      sourceNodeId,
      targetNodeId,
      text: 'Continue',
      order: sourceNode.choices.length,
      conditions: {},
    };

    // Update the source node with the new choice
    const updatedNodes = story.nodes.map(node => {
      if (node.id === sourceNodeId) {
        return {
          ...node,
          choices: [...node.choices, newChoice],
        };
      }
      return node;
    });

    setStory({
      ...story,
      nodes: updatedNodes,
    });

    // Auto-save after connection creation
    handleSave();
  }, [story, handleSave]);

  // Handle connection (choice) deletion
  const handleConnectionDelete = useCallback((sourceNodeId: string, targetNodeId: string) => {
    if (!story) return;

    // Update the source node by removing the choice
    const updatedNodes = story.nodes.map(node => {
      if (node.id === sourceNodeId) {
        return {
          ...node,
          choices: node.choices.filter(choice => choice.targetNodeId !== targetNodeId),
        };
      }
      return node;
    });

    setStory({
      ...story,
      nodes: updatedNodes,
    });

    // Auto-save after connection deletion
    handleSave();
  }, [story, handleSave]);

  // Handle choice update
  const handleChoiceUpdate = useCallback((nodeId: string, updatedChoice: Choice) => {
    if (!story) return;

    // Update the node with the modified choice
    const updatedNodes = story.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          choices: node.choices.map(choice =>
            choice.id === updatedChoice.id ? updatedChoice : choice
          ),
        };
      }
      return node;
    });

    setStory({
      ...story,
      nodes: updatedNodes,
    });

    // Auto-save after choice update
    handleSave();
  }, [story, handleSave]);

  // Handle node position update
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number, y: number }) => {
    if (!story) return;

    const updatedNodes = story.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          positionX: position.x,
          positionY: position.y,
        };
      }
      return node;
    });

    setStory({
      ...story,
      nodes: updatedNodes,
    });

    // Auto-save after position change
    handleSave();
  }, [story, handleSave]);

  // Handle back to graph view
  const handleBackToGraph = useCallback(() => {
    setCurrentView(EditorView.GRAPH);
    setSelectedNode(null);
  }, []);

  // Handle preview mode
  const handlePreviewMode = useCallback(() => {
    setCurrentView(EditorView.PREVIEW);
  }, []);

  if (isLoading && !story) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !story) {
    const errorMessage = error || 'Failed to load story';
    const isPermissionError = errorMessage.toLowerCase().includes('permission') ||
      errorMessage.toLowerCase().includes('unauthorized') ||
      errorMessage.toLowerCase().includes('forbidden');

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {isPermissionError ? 'You do not have permission to access this story' : errorMessage}
        </div>
        <Button onClick={() => navigate('/stories/manage')}>
          Back to My Stories
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Editor Toolbar */}
      <EditorToolbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onSave={handleSave}
        isSaving={isSaving}
        saveMessage={saveMessage}
        storyTitle={story.title}
      />

      {/* Main Editor Area */}
      <div className="flex-grow overflow-hidden">
        {currentView === EditorView.GRAPH && (
          <GraphEditor
            nodes={story.nodes}
            onNodeSelect={handleNodeSelect}
            onNodeCreate={handleNodeCreate}
            onNodeDelete={handleNodeDelete}
            onNodePositionChange={handleNodePositionChange}
            onConnectionCreate={handleConnectionCreate}
            onConnectionDelete={handleConnectionDelete}
            startNodeId={story.startNodeId}
          />
        )}

        {currentView === EditorView.NODE && selectedNode && (
          <NodeEditor
            node={selectedNode}
            onNodeUpdate={handleNodeUpdate}
            onChoiceUpdate={handleChoiceUpdate}
            onBackToGraph={handleBackToGraph}
            availableNodes={story.nodes.filter(node => node.id !== selectedNode.id)}
          />
        )}

        {currentView === EditorView.PREVIEW && (
          <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Preview Mode</h2>
              <p className="mb-4">Preview functionality will be implemented in task 4.3.</p>
              <Button onClick={handleBackToGraph}>
                Back to Editor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryEditor;