import React, { useCallback, useRef, useState, useEffect } from 'react';
import type { StoryNode } from '../../../types';
import type { JSX } from 'react/jsx-runtime';

interface GraphEditorProps {
  nodes: StoryNode[];
  startNodeId?: string;
  onNodeSelect: (node: StoryNode) => void;
  onNodeCreate: (position: { x: number, y: number }) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodePositionChange: (nodeId: string, position: { x: number, y: number }) => void;
  onConnectionCreate: (sourceNodeId: string, targetNodeId: string) => void;
  onConnectionDelete: (sourceNodeId: string, targetNodeId: string) => void;
}

interface Position {
  x: number;
  y: number;
}

interface NodeWithPosition extends StoryNode {
  position: Position;
}

const GraphEditor: React.FC<GraphEditorProps> = ({
  nodes,
  startNodeId,
  onNodeSelect,
  onNodeCreate,
  onNodeDelete,
  onNodePositionChange,
  onConnectionCreate,
  onConnectionDelete,
}) => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [connectingFromNode, setConnectingFromNode] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [canvasPosition, setCanvasPosition] = useState<Position>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [nodesWithPositions, setNodesWithPositions] = useState<NodeWithPosition[]>([]);

  // Track if we're actually dragging or just clicking
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTimeRef = useRef<number>(0);
  const dragDistanceRef = useRef<Position>({ x: 0, y: 0 });

  // Convert nodes to nodes with positions
  useEffect(() => {
    const updatedNodes = nodes.map(node => ({
      ...node,
      position: { x: node.positionX, y: node.positionY }
    }));
    setNodesWithPositions(updatedNodes);
  }, [nodes]);

  // Handle node click
  const handleNodeClick = useCallback((e: React.MouseEvent, node: StoryNode) => {
    e.stopPropagation();
    // Only select the node if we're not currently dragging
    if (!isDragging) {
      onNodeSelect(node);
      setSelectedNodeId(node.id);
    }
  }, [onNodeSelect, isDragging]);

  // Handle pane click and drag (for panning)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setConnectingFromNode(null);
  }, []);
  
  const handlePaneMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning with middle mouse button or when not connecting nodes
    if (e.button === 1 || (e.button === 0 && !connectingFromNode)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      
      const handlePanMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - panStart.x;
        const deltaY = moveEvent.clientY - panStart.y;
        
        setCanvasPosition(prev => ({
          x: prev.x + deltaX / scale,
          y: prev.y + deltaY / scale
        }));
        
        setPanStart({ x: moveEvent.clientX, y: moveEvent.clientY });
      };
      
      const handlePanEnd = () => {
        setIsPanning(false);
        document.removeEventListener('mousemove', handlePanMove);
        document.removeEventListener('mouseup', handlePanEnd);
      };
      
      document.addEventListener('mousemove', handlePanMove);
      document.addEventListener('mouseup', handlePanEnd);
    }
  }, [connectingFromNode, panStart, scale]);

  // Handle right click to create a new node
  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();

    if (!graphContainerRef.current) return;

    const rect = graphContainerRef.current.getBoundingClientRect();
    const position = {
      x: (event.clientX - rect.left) / scale - canvasPosition.x,
      y: (event.clientY - rect.top) / scale - canvasPosition.y,
    };

    onNodeCreate(position);
  }, [onNodeCreate, scale, canvasPosition]);

  // Handle node drag start
  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent default browser drag behavior

    if (!graphContainerRef.current) return;

    const node = nodesWithPositions.find(n => n.id === nodeId);
    if (!node) return;

    const rect = graphContainerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    // Record the start time and initial position for drag detection
    dragStartTimeRef.current = Date.now();
    dragDistanceRef.current = { x: 0, y: 0 };

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: node.position.x - (mouseX - canvasPosition.x),
      y: node.position.y - (mouseY - canvasPosition.y)
    });

    // Create custom mousemove and mouseup handlers for this specific drag operation
    const handleDragMove = (moveEvent: MouseEvent) => {
      if (!graphContainerRef.current) return;
      
      // Set isDragging to true as soon as we detect movement
      setIsDragging(true);
      
      const rect = graphContainerRef.current.getBoundingClientRect();
      const mouseX = (moveEvent.clientX - rect.left) / scale;
      const mouseY = (moveEvent.clientY - rect.top) / scale;
      
      const newX = mouseX - canvasPosition.x + dragOffset.x;
      const newY = mouseY - canvasPosition.y + dragOffset.y;
      
      // Calculate drag distance for drag detection
      dragDistanceRef.current = {
        x: dragDistanceRef.current.x + Math.abs(newX - node.position.x),
        y: dragDistanceRef.current.y + Math.abs(newY - node.position.y)
      };
      
      // Update node position in local state with smooth transition
      setNodesWithPositions(prev =>
        prev.map(n =>
          n.id === nodeId ? { ...n, position: { x: newX, y: newY } } : n
        )
      );
      
      // Update mouse position for other operations
      setMousePosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      
      // Prevent default to avoid text selection during drag
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
    };
    
    const handleDragEnd = () => {
      const dragDistance = Math.sqrt(
        Math.pow(dragDistanceRef.current.x, 2) + 
        Math.pow(dragDistanceRef.current.y, 2)
      );
      
      const node = nodesWithPositions.find(n => n.id === nodeId);
      if (node) {
        // Update the node position in the parent component
        onNodePositionChange(nodeId, node.position);
      }
      
      // If we've dragged more than 5 pixels, consider it a drag
      if (dragDistance > 5) {
        setIsDragging(true);
        // Reset after a delay to prevent immediate selection
        setTimeout(() => {
          setIsDragging(false);
        }, 300);
      } else {
        setIsDragging(false);
      }
      
      setDraggingNodeId(null);
      
      // Remove the event listeners
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    // Add event listeners for drag and drop
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [nodesWithPositions, scale, canvasPosition, dragOffset, onNodePositionChange]);

  // These handlers are now only used for connection creation, not for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // This is now only used for connection end, not for dragging
  const handleMouseUp = useCallback(() => {
    setDraggingNodeId(null);
  }, []);

  // Handle connection start
  const handleConnectionStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFromNode(nodeId);

    const handleConnectionMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Add event listeners for connection
    document.addEventListener('mousemove', handleConnectionMouseMove);
    document.addEventListener('mouseup', (e) => {
      handleConnectionEnd(e);
      document.removeEventListener('mousemove', handleConnectionMouseMove);
    });
  }, []);

  // Handle connection end
  const handleConnectionEnd = useCallback((e: MouseEvent) => {
    if (!connectingFromNode || !graphContainerRef.current) return;

    // Check if mouse is over a node
    const rect = graphContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find the node under the mouse
    const targetNode = nodesWithPositions.find(node => {
      const nodeX = (node.position.x + canvasPosition.x) * scale;
      const nodeY = (node.position.y + canvasPosition.y) * scale;
      const nodeWidth = 200; // Approximate node width
      const nodeHeight = 100; // Approximate node height

      return (
        mouseX >= nodeX &&
        mouseX <= nodeX + nodeWidth &&
        mouseY >= nodeY &&
        mouseY <= nodeY + nodeHeight
      );
    });

    if (targetNode && targetNode.id !== connectingFromNode) {
      onConnectionCreate(connectingFromNode, targetNode.id);
    }

    setConnectingFromNode(null);
  }, [connectingFromNode, nodesWithPositions, canvasPosition, scale, onConnectionCreate]);

  // Handle wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY;
    const newScale = Math.max(0.5, Math.min(2, scale + (delta > 0 ? -0.1 : 0.1)));

    setScale(newScale);
  }, [scale]);

  // Calculate connections between nodes
  const renderConnections = useCallback(() => {
    const connections: JSX.Element[] = [];

    nodesWithPositions.forEach(node => {
      node.choices.forEach(choice => {
        const targetNode = nodesWithPositions.find(n => n.id === choice.targetNodeId);
        if (!targetNode) return;

        const sourceX = (node.position.x + canvasPosition.x) * scale + 100; // Center of source node
        const sourceY = (node.position.y + canvasPosition.y) * scale + 50;
        const targetX = (targetNode.position.x + canvasPosition.x) * scale + 100; // Center of target node
        const targetY = (targetNode.position.y + canvasPosition.y) * scale + 50;

        // Calculate control points for curved line
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const controlX = sourceX + dx / 2;
        const controlY = sourceY + dy / 2;

        // Create SVG path
        const path = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;

        connections.push(
          <g key={`${node.id}-${targetNode.id}`}>
            <path
              d={path}
              stroke="#6366F1"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <text
              x={controlX}
              y={controlY - 10}
              textAnchor="middle"
              fill="#4B5563"
              fontSize="12"
              className="bg-white px-1"
            >
              {choice.text}
            </text>
            <circle
              cx={controlX}
              cy={controlY}
              r="5"
              fill="#EF4444"
              className="cursor-pointer hover:fill-red-700"
              onClick={() => onConnectionDelete(node.id, targetNode.id)}
            />
          </g>
        );
      });
    });

    // Add connecting line when creating a new connection
    if (connectingFromNode && mousePosition.x && mousePosition.y) {
      const sourceNode = nodesWithPositions.find(n => n.id === connectingFromNode);
      if (sourceNode) {
        const sourceX = (sourceNode.position.x + canvasPosition.x) * scale + 100;
        const sourceY = (sourceNode.position.y + canvasPosition.y) * scale + 50;

        connections.push(
          <path
            key="connecting-line"
            d={`M ${sourceX} ${sourceY} L ${mousePosition.x} ${mousePosition.y}`}
            stroke="#6366F1"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
          />
        );
      }
    }

    return connections;
  }, [nodesWithPositions, canvasPosition, scale, connectingFromNode, mousePosition, onConnectionDelete]);

  return (
    <div
      ref={graphContainerRef}
      className="h-full w-full bg-gray-100 relative overflow-hidden"
      onClick={handlePaneClick}
      onMouseDown={handlePaneMouseDown}
      onContextMenu={handlePaneContextMenu}
      onWheel={handleWheel}
    >
      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
          </marker>
        </defs>
        {renderConnections()}
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0">
        {nodesWithPositions.map(node => (
          <div
            key={node.id}
            className={`absolute p-4 w-[200px] rounded-lg shadow-md cursor-pointer transition-all duration-200 transform ${node.id === selectedNodeId ? 'ring-2 ring-blue-500 z-10' : ''
              } ${node.id === startNodeId ? 'bg-green-50 border-2 border-green-500' :
                node.isEnding ? 'bg-red-50 border-2 border-red-500' : 'bg-white border border-gray-300'
              } ${draggingNodeId === node.id ? 'opacity-70' : ''
              }`}
            style={{
              left: `${(node.position.x + canvasPosition.x) * scale}px`,
              top: `${(node.position.y + canvasPosition.y) * scale}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
            onClick={(e) => handleNodeClick(e, node)}
            onMouseDown={(e) => handleNodeDragStart(e, node.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-800 truncate">
                {node.title}
                {node.id === startNodeId && <span className="text-green-600 ml-2">(Start)</span>}
                {node.isEnding && <span className="text-red-600 ml-2">(Ending)</span>}
              </h3>
              {node.id !== startNodeId && (
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeDelete(node.id);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {node.content || 'No content yet'}
            </p>

            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-400">
                {node.choices.length} {node.choices.length === 1 ? 'choice' : 'choices'}
              </div>
              <button
                className="text-indigo-500 hover:text-indigo-700 text-xs flex items-center"
                onClick={(e) => handleConnectionStart(e, node.id)}
              >
                <span className="mr-1">+</span> Connect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={() => setScale(Math.min(2, scale + 0.1))}
        >
          +
        </button>
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
        >
          -
        </button>
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={() => {
            setCanvasPosition({ x: 0, y: 0 });
            setScale(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* Create Node Button */}
      <div className="absolute bottom-4 left-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md"
          onClick={() => {
            // Create node in the center of the visible area
            const centerX = -canvasPosition.x + (graphContainerRef.current?.clientWidth || 0) / (2 * scale);
            const centerY = -canvasPosition.y + (graphContainerRef.current?.clientHeight || 0) / (2 * scale);
            onNodeCreate({ x: centerX, y: centerY });
          }}
        >
          Create New Node
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-md shadow-md text-xs text-gray-600 max-w-xs">
        <p className="font-medium mb-1">Quick Tips:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Click a node to edit its content</li>
          <li>Drag nodes to reposition them</li>
          <li>Click "Connect" and then click another node to create a connection</li>
          <li>Right-click anywhere to create a new node</li>
          <li>Use mouse wheel to zoom in/out</li>
        </ul>
      </div>
    </div>
  );
};

export default GraphEditor;