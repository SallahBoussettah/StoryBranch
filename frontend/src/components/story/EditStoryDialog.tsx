import React from 'react';
import { Dialog, DialogHeader, DialogContent } from '../ui/Dialog';
import { StoryForm } from './StoryForm';
import type { Story } from '../../types';

interface EditStoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storyData: Partial<Story>) => void;
  story: Story;
  isSubmitting: boolean;
}

export const EditStoryDialog: React.FC<EditStoryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  story,
  isSubmitting
}) => {
  const handleSubmit = (storyData: Partial<Story>) => {
    onSubmit(storyData);
  };
  
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <h3 className="text-lg font-medium text-gray-900">Edit Story</h3>
      </DialogHeader>
      
      <DialogContent>
        <StoryForm
          initialData={story}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};