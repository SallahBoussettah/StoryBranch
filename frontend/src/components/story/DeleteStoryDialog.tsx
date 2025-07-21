import React from 'react';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface DeleteStoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  storyTitle: string;
  isDeleting: boolean;
}

export const DeleteStoryDialog: React.FC<DeleteStoryDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  storyTitle,
  isDeleting
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <h3 className="text-lg font-medium text-gray-900">Delete Story</h3>
      </DialogHeader>
      
      <DialogContent>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete <span className="font-semibold">{storyTitle}</span>? 
          This action cannot be undone and all associated data will be permanently removed.
        </p>
      </DialogContent>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        
        <Button 
          variant="danger" 
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};