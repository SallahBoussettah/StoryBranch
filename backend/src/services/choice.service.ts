import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Logger } from '../utils/logger';
import { 
  Choice, 
  CreateChoiceData, 
  UpdateChoiceData, 
  ChoiceResponseData, 
  toChoiceResponseData 
} from '../types/choice.types';

export class ChoiceService {
  /**
   * Get all choices for a source node
   */
  static async getChoicesBySourceNodeId(sourceNodeId: string): Promise<Choice[]> {
    return prisma.choice.findMany({
      where: { sourceNodeId },
      orderBy: { order: 'asc' }
    });
  }

  /**
   * Get choice by ID
   */
  static async getChoiceById(id: string): Promise<Choice> {
    const choice = await prisma.choice.findUnique({
      where: { id }
    });

    if (!choice) {
      throw new AppError('Choice not found', 404);
    }

    return choice;
  }

  /**
   * Create a new choice
   */
  static async createChoice(data: CreateChoiceData): Promise<Choice> {
    try {
      // Get the current highest order for the source node
      const highestOrderChoice = await prisma.choice.findFirst({
        where: { sourceNodeId: data.sourceNodeId },
        orderBy: { order: 'desc' }
      });

      const order = data.order || (highestOrderChoice ? highestOrderChoice.order + 1 : 0);

      const choice = await prisma.choice.create({
        data: {
          sourceNodeId: data.sourceNodeId,
          targetNodeId: data.targetNodeId,
          text: data.text,
          order,
          conditions: data.conditions || {}
        }
      });

      Logger.info(`Choice created: ${choice.id}`);
      return choice;
    } catch (error) {
      Logger.error('Error creating choice', error);
      throw new AppError('Failed to create choice', 500);
    }
  }

  /**
   * Update a choice
   */
  static async updateChoice(id: string, data: UpdateChoiceData): Promise<Choice> {
    // Check if choice exists
    await this.getChoiceById(id);

    try {
      const updatedChoice = await prisma.choice.update({
        where: { id },
        data: {
          ...(data.targetNodeId !== undefined && { targetNodeId: data.targetNodeId }),
          ...(data.text !== undefined && { text: data.text }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.conditions !== undefined && { conditions: data.conditions })
        }
      });

      Logger.info(`Choice updated: ${id}`);
      return updatedChoice;
    } catch (error) {
      Logger.error(`Error updating choice ${id}`, error);
      throw new AppError('Failed to update choice', 500);
    }
  }

  /**
   * Delete a choice
   */
  static async deleteChoice(id: string): Promise<void> {
    // Check if choice exists
    await this.getChoiceById(id);

    try {
      await prisma.choice.delete({
        where: { id }
      });
      
      Logger.info(`Choice deleted: ${id}`);
    } catch (error) {
      Logger.error(`Error deleting choice ${id}`, error);
      throw new AppError('Failed to delete choice', 500);
    }
  }

  /**
   * Validate story structure integrity
   */
  static async validateStoryStructure(storyId: string): Promise<{
    isValid: boolean;
    startNode: boolean;
    endingNodes: boolean;
    orphanedNodes: string[];
    unreachableNodes: string[];
    deadEnds: string[];
  }> {
    try {
      // Get all nodes for the story
      const nodes = await prisma.node.findMany({
        where: { storyId },
        include: {
          sourceChoices: true,
          targetChoices: true
        }
      });

      if (nodes.length === 0) {
        return {
          isValid: false,
          startNode: false,
          endingNodes: false,
          orphanedNodes: [],
          unreachableNodes: [],
          deadEnds: []
        };
      }

      // Check if there is a start node
      const startNode = nodes.find(node => 
        node.metadata && 
        typeof node.metadata === 'object' && 
        (node.metadata as any).isStart === true
      );
      const hasStartNode = !!startNode;

      // Check if there are ending nodes
      const endingNodes = nodes.filter(node => node.isEnding);
      const hasEndingNodes = endingNodes.length > 0;

      // Find orphaned nodes (no incoming choices except start node)
      const orphanedNodes = nodes
        .filter(node => 
          node.targetChoices.length === 0 && 
          !(node.metadata && typeof node.metadata === 'object' && (node.metadata as any).isStart === true)
        )
        .map(node => node.id);

      // Find unreachable nodes (not reachable from start node)
      const reachableNodes = new Set<string>();
      
      if (startNode) {
        // Perform BFS from start node
        const queue = [startNode.id];
        reachableNodes.add(startNode.id);
        
        while (queue.length > 0) {
          const currentNodeId = queue.shift()!;
          const currentNode = nodes.find(node => node.id === currentNodeId);
          
          if (currentNode) {
            for (const choice of currentNode.sourceChoices) {
              if (!reachableNodes.has(choice.targetNodeId)) {
                reachableNodes.add(choice.targetNodeId);
                queue.push(choice.targetNodeId);
              }
            }
          }
        }
      }
      
      const unreachableNodes = nodes
        .filter(node => !reachableNodes.has(node.id))
        .map(node => node.id);

      // Find dead ends (non-ending nodes with no outgoing choices)
      const deadEnds = nodes
        .filter(node => !node.isEnding && node.sourceChoices.length === 0)
        .map(node => node.id);

      // Determine if the story structure is valid
      const isValid = hasStartNode && 
                      hasEndingNodes && 
                      orphanedNodes.length === 0 && 
                      unreachableNodes.length === 0 && 
                      deadEnds.length === 0;

      return {
        isValid,
        startNode: hasStartNode,
        endingNodes: hasEndingNodes,
        orphanedNodes,
        unreachableNodes,
        deadEnds
      };
    } catch (error) {
      Logger.error(`Error validating story structure for story ${storyId}`, error);
      throw new AppError('Failed to validate story structure', 500);
    }
  }

  /**
   * Get choice response data
   */
  static getChoiceResponseData(choice: Choice): ChoiceResponseData {
    return toChoiceResponseData(choice);
  }
}