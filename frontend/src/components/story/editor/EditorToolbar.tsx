import React from 'react';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';

// Enum for editor views (must match the one in StoryEditor.tsx)
enum EditorView {
  GRAPH = 'graph',
  NODE = 'node',
  PREVIEW = 'preview',
}

interface EditorToolbarProps {
  currentView: EditorView;
  onViewChange: (view: EditorView) => void;
  onSave: () => void;
  isSaving: boolean;
  saveMessage: string | null;
  storyTitle: string;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  currentView,
  onViewChange,
  onSave,
  isSaving,
  saveMessage,
  storyTitle,
}) => {
  return (
    <div className="bg-white border-b shadow-sm p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold truncate max-w-md">
            {storyTitle}
          </h1>
          
          {saveMessage && (
            <span className={`text-sm ${
              saveMessage === 'Saved' ? 'text-green-600' : 
              saveMessage === 'Saving...' ? 'text-blue-600' : 
              'text-red-600'
            }`}>
              {saveMessage}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                currentView === EditorView.GRAPH ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => onViewChange(EditorView.GRAPH)}
            >
              Graph
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                currentView === EditorView.PREVIEW ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => onViewChange(EditorView.PREVIEW)}
            >
              Preview
            </button>
          </div>
          
          <Button 
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;