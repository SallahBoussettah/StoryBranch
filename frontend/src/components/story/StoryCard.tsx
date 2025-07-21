import React from 'react';
import { Link } from 'react-router-dom';
import type { Story } from '../../types';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface StoryCardProps {
  story: Story;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  onEdit, 
  onDelete,
  onPublish
}) => {
  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge variant
  const getStatusBadge = () => {
    switch (story.status) {
      case 'DRAFT':
        return <Badge variant="warning">Draft</Badge>;
      case 'PUBLISHED':
        return <Badge variant="success">Published</Badge>;
      case 'ARCHIVED':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-grow">
        <div className="relative pb-2">
          {story.coverImageUrl ? (
            <img 
              src={story.coverImageUrl} 
              alt={story.title} 
              className="w-full h-40 object-cover rounded-md mb-4"
            />
          ) : (
            <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-400">
              No Cover Image
            </div>
          )}
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{story.title}</h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {story.genres?.map((genre, index) => (
            <Badge key={index} variant="primary" className="mr-1 mb-1">
              {genre}
            </Badge>
          ))}
        </div>
        
        <div className="text-sm text-gray-500 mt-2">
          <p>Created: {formatDate(story.createdAt)}</p>
          <p>Updated: {formatDate(story.updatedAt)}</p>
          {story.publishedAt && (
            <p>Published: {formatDate(story.publishedAt)}</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between w-full">
          <Link to={`/stories/${story.id}`} className="text-blue-600 hover:underline">
            <Button variant="outline" size="sm">View</Button>
          </Link>
          
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            
            {story.status === 'DRAFT' && onPublish && (
              <Button variant="primary" size="sm" onClick={onPublish}>
                Publish
              </Button>
            )}
            
            {onDelete && (
              <Button variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};