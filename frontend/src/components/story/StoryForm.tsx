import React, { useState } from 'react';
import type { Story } from '../../types';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';

interface StoryFormProps {
  initialData?: Partial<Story>;
  onSubmit: (storyData: Partial<Story>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const StoryForm: React.FC<StoryFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Partial<Story>>({
    title: initialData.title || '',
    description: initialData.description || '',
    coverImageUrl: initialData.coverImageUrl || '',
    genres: initialData.genres || [],
    difficulty: initialData.difficulty || 'MEDIUM'
  });
  
  const [genreInput, setGenreInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const addGenre = () => {
    if (!genreInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      genres: [...(prev.genres || []), genreInput.trim()]
    }));
    
    setGenreInput('');
  };
  
  const removeGenre = (index: number) => {
    setFormData(prev => ({
      ...prev,
      genres: (prev.genres || []).filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        id="title"
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />
      
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.description ? 'border-red-500' : ''
          }`}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
      
      <FormInput
        id="coverImageUrl"
        label="Cover Image URL"
        name="coverImageUrl"
        value={formData.coverImageUrl}
        onChange={handleChange}
        placeholder="https://example.com/image.jpg"
      />
      
      <div className="space-y-1">
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
          Difficulty
        </label>
        <select
          id="difficulty"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Genres
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add a genre"
          />
          <Button 
            type="button" 
            onClick={addGenre}
            variant="outline"
            className="ml-2"
          >
            Add
          </Button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.genres?.map((genre, index) => (
            <div 
              key={index} 
              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
            >
              {genre}
              <button
                type="button"
                onClick={() => removeGenre(index)}
                className="ml-1 text-blue-800 hover:text-blue-900 focus:outline-none"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData.id ? 'Update Story' : 'Create Story'}
        </Button>
      </div>
    </form>
  );
};