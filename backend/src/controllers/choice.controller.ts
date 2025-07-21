import { Request, Response, NextFunction } from 'express';
import { ChoiceService } from '../services/choice.service';
import { NodeService } from '../services/node.service';
import { StoryService } from '../services/story.service';
import { AppError } from '../middleware/error.middleware';
import { validateChoiceData } from '../utils/validation';
import { UserRole } from '../generated/prisma';

/**
 * Choice controller class
 */
export class ChoiceController {
  /**
   * Get all choices for a node
   */
  static async getNodeChoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nodeId } = req.params;
      
      // Check if node exists
      const node = await NodeService.getNodeById(nodeId);
      
      // Check if story exists and user is authorized to view it
      const story = await StoryService.getStoryById(node.storyId);
      
      if (
        story.status !== 'PUBLISHED' && 
        (!req.user || (req.user.id !== story.authorId && req.user.role !== UserRole.ADMIN))
      ) {
        throw new AppError('You do not have permission to access this node', 403);
      }
      
      const choices = await ChoiceService.getChoicesBySourceNodeId(nodeId);
      
      res.status(200).json({
        status: 'success',
        results: choices.length,
        data: {
          choices: choices.map(choice => ChoiceService.getChoiceResponseData(choice))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get choice by ID
   */
  static async getChoiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const choice = await ChoiceService.getChoiceById(id);
      
      // Check if user has permission to access the choice
      const sourceNode = await NodeService.getNodeById(choice.sourceNodeId);
      const story = await StoryService.getStoryById(sourceNode.storyId);
      
      if (
        story.status !== 'PUBLISHED' && 
        (!req.user || (req.user.id !== story.authorId && req.user.role !== UserRole.ADMIN))
      ) {
        throw new AppError('You do not have permission to access this choice', 403);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          choice: ChoiceService.getChoiceResponseData(choice)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new choice
   * Protected endpoint - only author or admin can create
   */
  static async createChoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { nodeId } = req.params;
      
      // Check if source node exists
      const sourceNode = await NodeService.getNodeById(nodeId);
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(sourceNode.storyId);
      
      // Only author or admin can create choices
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to create choices for this node', 403);
      }

      // Validate request body
      const validationError = validateChoiceData(req.body);
      if (validationError) {
        throw new AppError(validationError, 400);
      }

      // Check if target node exists and belongs to the same story
      const targetNode = await NodeService.getNodeById(req.body.targetNodeId);
      if (targetNode.storyId !== sourceNode.storyId) {
        throw new AppError('Target node must belong to the same story', 400);
      }

      const choiceData = {
        sourceNodeId: nodeId,
        targetNodeId: req.body.targetNodeId,
        text: req.body.text,
        order: req.body.order || 0,
        conditions: req.body.conditions || {}
      };

      const choice = await ChoiceService.createChoice(choiceData);
      
      res.status(201).json({
        status: 'success',
        data: {
          choice: ChoiceService.getChoiceResponseData(choice)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a choice
   * Protected endpoint - only author or admin can update
   */
  static async updateChoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      
      // Check if choice exists
      const choice = await ChoiceService.getChoiceById(id);
      
      // Check if source node exists
      const sourceNode = await NodeService.getNodeById(choice.sourceNodeId);
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(sourceNode.storyId);
      
      // Only author or admin can update choices
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to update this choice', 403);
      }

      // Validate request body
      if (Object.keys(req.body).length === 0) {
        throw new AppError('No update data provided', 400);
      }

      // If target node is being updated, check if it exists and belongs to the same story
      if (req.body.targetNodeId) {
        const targetNode = await NodeService.getNodeById(req.body.targetNodeId);
        if (targetNode.storyId !== sourceNode.storyId) {
          throw new AppError('Target node must belong to the same story', 400);
        }
      }

      const updateData = {
        targetNodeId: req.body.targetNodeId,
        text: req.body.text,
        order: req.body.order,
        conditions: req.body.conditions
      };

      const updatedChoice = await ChoiceService.updateChoice(id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          choice: ChoiceService.getChoiceResponseData(updatedChoice)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a choice
   * Protected endpoint - only author or admin can delete
   */
  static async deleteChoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      
      // Check if choice exists
      const choice = await ChoiceService.getChoiceById(id);
      
      // Check if source node exists
      const sourceNode = await NodeService.getNodeById(choice.sourceNodeId);
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(sourceNode.storyId);
      
      // Only author or admin can delete choices
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to delete this choice', 403);
      }

      await ChoiceService.deleteChoice(id);
      
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate story structure integrity
   * Protected endpoint - only author or admin can validate
   */
  static async validateStoryStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { storyId } = req.params;
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(storyId);
      
      // Only author or admin can validate story structure
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to validate this story structure', 403);
      }

      const validationResult = await ChoiceService.validateStoryStructure(storyId);
      
      res.status(200).json({
        status: 'success',
        data: validationResult
      });
    } catch (error) {
      next(error);
    }
  }
}