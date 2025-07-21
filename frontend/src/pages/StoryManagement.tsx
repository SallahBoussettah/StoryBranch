import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryStore } from '../store/storyStore';
import type { Story } from '../types';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { StoryCard } from '../components/story/StoryCard';
import { CreateStoryDialog } from '../components/story/CreateStoryDialog';
import { EditStoryDialog } from '../components/story/EditStoryDialog';
import { DeleteStoryDialog } from '../components/story/DeleteStoryDialog';

const StoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { 
    myStories, 
    fetchMyStories, 
    createStory, 
    updateStory, 
    deleteStory,
    publishStory,
    isLoading, 
    error 
  } = useStoryStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    fetchMyStories();
  }, [fetchMyStories]);
  
  const handleCreateStory = async (storyData: Partial<Story>) => {
    setIsSubmitting(true);
    try {
      await createStory(storyData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditStory = async (storyData: Partial<Story>) => {
    if (!selectedStory) return;
    
    setIsSubmitting(true);
    try {
      await updateStory(selectedStory.id, storyData);
      setIsEditDialogOpen(false);
      setSelectedStory(null);
    } catch (error) {
      console.error('Failed to update story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteStory = async () => {
    if (!selectedStory) return;
    
    setIsDeleting(true);
    try {
      await deleteStory(selectedStory.id);
      setIsDeleteDialogOpen(false);
      setSelectedStory(null);
    } catch (error) {
      console.error('Failed to delete story:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handlePublishStory = async (story: Story) => {
    try {
      await publishStory(story.id);
    } catch (error) {
      console.error('Failed to publish story:', error);
    }
  };
  
  const openEditDialog = (story: Story) => {
    // Instead of opening the dialog, navigate to the story editor
    navigate(`/stories/${story.id}/edit`);
  };
  
  const openDeleteDialog = (story: Story) => {
    setSelectedStory(story);
    setIsDeleteDialogOpen(true);
  };
  
  // Group stories by status
  const draftStories = myStories.filter(story => story.status === 'DRAFT');
  const publishedStories = myStories.filter(story => story.status === 'PUBLISHED');
  const archivedStories = myStories.filter(story => story.status === 'ARCHIVED');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Stories</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create New Story
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {isLoading && !myStories.length ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {!myStories.length ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No stories yet</h3>
              <p className="text-gray-500 mb-6">Create your first interactive story to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create New Story
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Draft Stories */}
              {draftStories.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Drafts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {draftStories.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        onEdit={() => openEditDialog(story)}
                        onDelete={() => openDeleteDialog(story)}
                        onPublish={() => handlePublishStory(story)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Published Stories */}
              {publishedStories.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Published</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedStories.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        onEdit={() => openEditDialog(story)}
                        onDelete={() => openDeleteDialog(story)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Archived Stories */}
              {archivedStories.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Archived</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedStories.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        onDelete={() => openDeleteDialog(story)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Create Story Dialog */}
      <CreateStoryDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateStory}
        isSubmitting={isSubmitting}
      />
      
      {/* Edit Story Dialog */}
      {selectedStory && (
        <EditStoryDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedStory(null);
          }}
          onSubmit={handleEditStory}
          story={selectedStory}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Delete Story Dialog */}
      {selectedStory && (
        <DeleteStoryDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedStory(null);
          }}
          onConfirm={handleDeleteStory}
          storyTitle={selectedStory.title}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default StoryManagement;