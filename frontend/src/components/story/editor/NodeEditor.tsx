import React, { useState, useEffect } from 'react';
import type { StoryNode, Choice } from '../../../types';
import { Button } from '../../ui/Button';
import { FormInput } from '../../ui/FormInput';

interface NodeEditorProps {
  node: StoryNode;
  availableNodes: StoryNode[];
  onNodeUpdate: (updatedNode: StoryNode) => void;
  onChoiceUpdate: (nodeId: string, updatedChoice: Choice) => void;
  onBackToGraph: () => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  availableNodes,
  onNodeUpdate,
  onChoiceUpdate,
  onBackToGraph,
}) => {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const [isEnding, setIsEnding] = useState(node.isEnding);
  const [choices, setChoices] = useState<Choice[]>(node.choices);
  
  // Update local state when node prop changes
  useEffect(() => {
    setTitle(node.title);
    setContent(node.content);
    setIsEnding(node.isEnding);
    setChoices(node.choices);
  }, [node]);
  
  // Handle save
  const handleSave = () => {
    const updatedNode: StoryNode = {
      ...node,
      title,
      content,
      isEnding,
      choices,
    };
    
    onNodeUpdate(updatedNode);
  };
  
  // Handle choice text update
  const handleChoiceTextChange = (choiceId: string, text: string) => {
    const updatedChoices = choices.map(choice => 
      choice.id === choiceId ? { ...choice, text } : choice
    );
    
    setChoices(updatedChoices);
    
    // Find the updated choice
    const updatedChoice = updatedChoices.find(choice => choice.id === choiceId);
    if (updatedChoice) {
      onChoiceUpdate(node.id, updatedChoice);
    }
  };
  
  // Handle adding a new choice
  const handleAddChoice = () => {
    // Filter out nodes that are already targets of existing choices
    const availableTargetNodes = availableNodes.filter(availableNode => 
      !choices.some(choice => choice.targetNodeId === availableNode.id)
    );
    
    if (availableTargetNodes.length === 0) {
      alert('No available nodes to connect to. Create more nodes first.');
      return;
    }
    
    const targetNodeId = availableTargetNodes[0].id;
    
    const newChoice: Choice = {
      id: `temp-choice-${Date.now()}`, // Will be replaced by backend
      sourceNodeId: node.id,
      targetNodeId,
      text: 'Continue',
      order: choices.length,
      conditions: {},
    };
    
    const updatedChoices = [...choices, newChoice];
    setChoices(updatedChoices);
    
    const updatedNode: StoryNode = {
      ...node,
      choices: updatedChoices,
    };
    
    onNodeUpdate(updatedNode);
  };
  
  // Handle removing a choice
  const handleRemoveChoice = (choiceId: string) => {
    const updatedChoices = choices.filter(choice => choice.id !== choiceId);
    setChoices(updatedChoices);
    
    const updatedNode: StoryNode = {
      ...node,
      choices: updatedChoices,
    };
    
    onNodeUpdate(updatedNode);
  };
  
  // Handle changing a choice's target node
  const handleChoiceTargetChange = (choiceId: string, targetNodeId: string) => {
    const updatedChoices = choices.map(choice => 
      choice.id === choiceId ? { ...choice, targetNodeId } : choice
    );
    
    setChoices(updatedChoices);
    
    // Find the updated choice
    const updatedChoice = updatedChoices.find(choice => choice.id === choiceId);
    if (updatedChoice) {
      onChoiceUpdate(node.id, updatedChoice);
    }
  };
  
  return (
    <div className="h-full overflow-y-auto bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Node</h2>
          <div className="space-x-2">
            <Button variant="outline" onClick={onBackToGraph}>
              Back to Graph
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
        
        {/* Node Title */}
        <div className="mb-6">
          <FormInput
            id="node-title"
            label="Node Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this node"
          />
        </div>
        
        {/* Node Type */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnding}
              onChange={(e) => setIsEnding(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>This is an ending node</span>
          </label>
          {isEnding && (
            <p className="text-sm text-gray-500 mt-1">
              Ending nodes represent the conclusion of a story path.
            </p>
          )}
        </div>
        
        {/* Node Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Content
          </label>
          
          {/* Simple textarea as a placeholder */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-md p-3 min-h-[200px]"
            placeholder="Write your story content here..."
          />
        </div>
        
        {/* Choices Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Choices</h3>
            <Button 
              size="sm" 
              onClick={handleAddChoice}
              disabled={isEnding || availableNodes.length === 0}
            >
              Add Choice
            </Button>
          </div>
          
          {isEnding && (
            <p className="text-sm text-amber-600 mb-3">
              Ending nodes cannot have choices.
            </p>
          )}
          
          {!isEnding && choices.length === 0 && (
            <p className="text-sm text-gray-500 mb-3">
              No choices added yet. Add a choice to create a path to another node.
            </p>
          )}
          
          {!isEnding && choices.length > 0 && (
            <div className="space-y-4">
              {choices.map((choice) => {
                const targetNode = availableNodes.find(n => n.id === choice.targetNodeId);
                
                return (
                  <div key={choice.id} className="border rounded-md p-4 bg-gray-50">
                    <div className="mb-3">
                      <FormInput
                        id={`choice-text-${choice.id}`}
                        label="Choice Text"
                        value={choice.text}
                        onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                        placeholder="Enter the text for this choice"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Node
                      </label>
                      <select
                        value={choice.targetNodeId}
                        onChange={(e) => handleChoiceTargetChange(choice.id, e.target.value)}
                        className="w-full border rounded-md p-2"
                      >
                        {availableNodes.map((availableNode) => (
                          <option key={availableNode.id} value={availableNode.id}>
                            {availableNode.title} {availableNode.isEnding ? '(Ending)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleRemoveChoice(choice.id)}
                      >
                        Remove Choice
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;