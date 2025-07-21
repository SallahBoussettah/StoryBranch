import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Logger } from '../utils/logger';
import { 
  Node, 
  CreateNodeData, 
  UpdateNodeData, 
  NodeResponseData, 
  toNodeResponseData 
} from '../types/node.types';

export class NodeService {
  /**
   * Get all nodes for a story
   */
  static async getNodesByStoryId(storyId: string): Promise<Node[]> {
    return prisma.node.findMany({
      where: { storyId }
    });
  }

  /**
   * Get node by ID
   */
  static async getNodeById(id: string): Promise<Node> {
    const node = await prisma.node.findUnique({
      where: { id }
    });

    if (!node) {
      throw new AppError('Node not found', 404);
    }

    return node;
  }

  /**
   * Create a new node
   */
  static async createNode(data: CreateNodeData): Promise<Node> {
    try {
      const node = await prisma.node.create({
        data: {
          storyId: data.storyId,
          title: data.title,
          content: data.content,
          isEnding: data.isEnding || false,
          metadata: data.metadata || {},
          positionX: data.positionX || 0,
          positionY: data.positionY || 0
        }
      });

      Logger.info(`Node created: ${node.id}`);
      return node;
    } catch (error) {
      Logger.error('Error creating node', error);
      throw new AppError('Failed to create node', 500);
    }
  }

  /**
   * Update a node
   */
  static async updateNode(id: string, data: UpdateNodeData): Promise<Node> {
    // Check if node exists
    await this.getNodeById(id);

    try {
      const updatedNode = await prisma.node.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.isEnding !== undefined && { isEnding: data.isEnding }),
          ...(data.metadata !== undefined && { metadata: data.metadata }),
          ...(data.positionX !== undefined && { positionX: data.positionX }),
          ...(data.positionY !== undefined && { positionY: data.positionY })
        }
      });

      Logger.info(`Node updated: ${id}`);
      return updatedNode;
    } catch (error) {
      Logger.error(`Error updating node ${id}`, error);
      throw new AppError('Failed to update node', 500);
    }
  }

  /**
   * Delete a node
   */
  static async deleteNode(id: string): Promise<void> {
    // Check if node exists
    await this.getNodeById(id);

    try {
      await prisma.node.delete({
        where: { id }
      });
      
      Logger.info(`Node deleted: ${id}`);
    } catch (error) {
      Logger.error(`Error deleting node ${id}`, error);
      throw new AppError('Failed to delete node', 500);
    }
  }

  /**
   * Get node response data
   */
  static getNodeResponseData(node: Node): NodeResponseData {
    return toNodeResponseData(node);
  }
}