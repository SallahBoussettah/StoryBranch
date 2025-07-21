import { Request, Response, NextFunction } from 'express';
import { NodeService } from '../services/node.service';
import { AppError } from '../middleware/error.middleware';
import { validateNodeData } from '../utils/validation';
import { StoryService } from '../services/story.service';
import { UserRole } from '../generated/prisma';

/**
 * Node controller class
 */
export class NodeController {
  /**
   * Get all nodes for a story
   */
  static async getStoryNodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { storyId } = req.params;
      
      // Check if story exists
      const story = await StoryService.getStoryById(storyId);
      
      // Check if story is published or if user is authorized to view it
      if (
        story.status !== 'PUBLISHED' && 
        (!req.user || (req.user.id !== story.authorId && req.user.role !== UserRole.ADMIN))
      ) {
        throw new AppError('You do not have permission to access this story', 403);
      }
      
      const nodes = await NodeService.getNodesByStoryId(storyId);
      
      res.status(200).json({
        status: 'success',
        results: nodes.length,
        data: {
          nodes: nodes.map(node => NodeService.getNodeResponseData(node))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get node by ID
   */
  static async getNodeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const node = await NodeService.getNodeById(id);
      
      // Check if user has permission to access the node
      const story = await StoryService.getStoryById(node.storyId);
      
      if (
        story.status !== 'PUBLISHED' && 
        (!req.user || (req.user.id !== story.authorId && req.user.role !== UserRole.ADMIN))
      ) {
        throw new AppError('You do not have permission to access this node', 403);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          node: NodeService.getNodeResponseData(node)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new node
   * Protected endpoint - only author or admin can create
   */
  static async createNode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { storyId } = req.params;
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(storyId);
      
      // Only author or admin can create nodes
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to create nodes for this story', 403);
      }

      // Validate request body
      const validationError = validateNodeData(req.body);
      if (validationError) {
        throw new AppError(validationError, 400);
      }

      const nodeData = {
        storyId,
        title: req.body.title,
        content: req.body.content,
        isEnding: req.body.isEnding || false,
        metadata: req.body.metadata || {},
        positionX: req.body.positionX || 0,
        positionY: req.body.positionY || 0
      };

      const node = await NodeService.createNode(nodeData);
      
      res.status(201).json({
        status: 'success',
        data: {
          node: NodeService.getNodeResponseData(node)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a node
   * Protected endpoint - only author or admin can update
   */
  static async updateNode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      
      // Check if node exists
      const node = await NodeService.getNodeById(id);
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(node.storyId);
      
      // Only author or admin can update nodes
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to update this node', 403);
      }

      // Validate request body
      if (Object.keys(req.body).length === 0) {
        throw new AppError('No update data provided', 400);
      }

      const updateData = {
        title: req.body.title,
        content: req.body.content,
        isEnding: req.body.isEnding,
        metadata: req.body.metadata,
        positionX: req.body.positionX,
        positionY: req.body.positionY
      };

      const updatedNode = await NodeService.updateNode(id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          node: NodeService.getNodeResponseData(updatedNode)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a node
   * Protected endpoint - only author or admin can delete
   */
  static async deleteNode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      
      // Check if node exists
      const node = await NodeService.getNodeById(id);
      
      // Check if story exists and user is authorized
      const story = await StoryService.getStoryById(node.storyId);
      
      // Only author or admin can delete nodes
      if (story.authorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        throw new AppError('You do not have permission to delete this node', 403);
      }

      await NodeService.deleteNode(id);
      
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}