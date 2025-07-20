/**
 * Base service class that other services can extend
 */
export abstract class BaseService<T> {
  /**
   * Find all entities
   */
  abstract findAll(): Promise<T[]>;

  /**
   * Find entity by ID
   * @param id - Entity ID
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Create a new entity
   * @param data - Entity data
   */
  abstract create(data: Partial<T>): Promise<T>;

  /**
   * Update an entity
   * @param id - Entity ID
   * @param data - Updated entity data
   */
  abstract update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Delete an entity
   * @param id - Entity ID
   */
  abstract delete(id: string): Promise<boolean>;
}