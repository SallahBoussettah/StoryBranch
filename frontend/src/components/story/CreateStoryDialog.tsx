import React from 'react';
import { Dialog, DialogHeader, DialogContent } from '../ui/Dialog';
import { StoryForm } from './StoryForm';
import type { Story } from '../../types';

interface CreateStoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storyData: Partial<Story>) => void;
  isSubmitting: boolean;
}

export const CreateStoryDialog: React.FC<CreateStoryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const handleSubmit = (storyData: Partial<Story>) => {
    onSubmit(storyData);
  };
  
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <h3 className="text-lg font-medium text-gray-900">Create New Story</h3>
      </DialogHeader>
      
      <DialogContent>
        <StoryForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};