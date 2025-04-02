'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import React from 'react';

type Step = 'select_behavior' | 'has_next_step' | 'research' | 'capture_behavior' | 'specific_enough' | 'breakdown' | 'select_times' | 'create_map';

interface TriggerInput {
  id: string;
  before: string;
  after: string;
  behavior: string;
}

interface Behavior {
  id: string;
  content: string;
  isSpecific: boolean;
  nextSteps: string[];
}

interface TriggerMapNode {
  id: string;
  type: NodeType;
  content: string;
  position: { x: number; y: number };
}

const NODE_TYPES = {
  TRIGGER: 'TRIGGER',
  ACTION: 'ACTION',
  OUTCOME: 'OUTCOME',
} as const;

type NodeType = 'TRIGGER' | 'ACTION' | 'OUTCOME';

export default function TriggerMapFlow() {
  const { data: session } = useSession();
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>('select_behavior');
  const [behaviorTitle, setBehaviorTitle] = useState('');
  const [behavior, setBehavior] = useState<Behavior>({
    id: '',
    content: '',
    isSpecific: false,
    nextSteps: [],
  });
  const [nextStep, setNextStep] = useState('');
  const [nodes, setNodes] = useState<TriggerMapNode[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBeforeSelected, setIsBeforeSelected] = useState(false);
  const [triggerInputs, setTriggerInputs] = useState<TriggerInput[]>([{
    id: '1',
    before: '',
    after: '',
    behavior: '',
  }]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [stateLoaded, setStateLoaded] = useState(false);

  // Add a ref to track if we've attempted to restore state
  const hasAttemptedRestore = useRef(false);

  const handleBehaviorSelect = (content: string) => {
    setBehavior(prev => ({ ...prev, content }));
    setCurrentStep('has_next_step');
  };

  const handleHasNextStep = (hasNextStep: boolean) => {
    if (!hasNextStep) {
      setCurrentStep('research');
    } else {
      setCurrentStep('capture_behavior');
    }
  };

  const handleResearchComplete = () => {
    setCurrentStep('capture_behavior');
  };

  const handleBehaviorCapture = (content: string) => {
    setNextStep(content);
    setCurrentStep('specific_enough');
  };

  const handleSpecificityCheck = (isSpecific: boolean) => {
    setBehavior(prev => ({ ...prev, isSpecific }));
    if (isSpecific) {
      setCurrentStep('select_times');
    } else {
      setCurrentStep('breakdown');
    }
  };

  const handleBreakdown = (nextSteps: string[]) => {
    setBehavior(prev => ({ ...prev, nextSteps }));
    setCurrentStep('select_times');
  };

  const handleNodeEdit = (nodeId: string, newContent: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, content: newContent } : node
    ));
    setEditingNodeId(null);
  };

  const handleAddNode = (nodeId: string, position: 'above' | 'below') => {
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;

    const currentNode = nodes[nodeIndex];
    const spacing = 100;
    
    // Create new node with correct type
    const newNode: TriggerMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: NODE_TYPES.ACTION,  // Always create new nodes as ACTION type
      content: '',
      position: { ...currentNode.position },
    };

    // Adjust positions based on insertion point
    const updatedNodes = [...nodes];
    if (position === 'above') {
      // Move current and following nodes down
      updatedNodes.forEach(node => {
        if (node.position.y >= currentNode.position.y) {
          node.position.y += spacing;
        }
      });
      newNode.position.y = currentNode.position.y - spacing;
    } else {
      // Move following nodes down
      updatedNodes.forEach(node => {
        if (node.position.y > currentNode.position.y) {
          node.position.y += spacing;
        }
      });
      newNode.position.y = currentNode.position.y + spacing;
    }

    updatedNodes.splice(nodeIndex + (position === 'below' ? 1 : 0), 0, newNode);
    setNodes(updatedNodes);
    setEditingNodeId(newNode.id);
  };

  const handleCreateMap = () => {
    const newNodes: TriggerMapNode[] = [];
    const centerX = window.innerWidth / 2;
    const startY = 100;
    const spacing = 100;

    console.log('Creating map with NODE_TYPES:', NODE_TYPES);

    if (isBeforeSelected) {
      // For Before: action first, then trigger
      if (nextStep) {
        const actionNode = {
          id: `action-1`,
          type: NODE_TYPES.ACTION,  // Always use ACTION type for behavior nodes
          content: nextStep.replace(/^I will /, ''),
          position: { x: centerX, y: startY },
        };
        console.log('Creating action node:', actionNode);
        newNodes.push(actionNode);
      }
      if (triggerInputs[0].before) {
        const triggerNode = {
          id: `trigger-1`,
          type: NODE_TYPES.TRIGGER,
          content: triggerInputs[0].before,
          position: { x: centerX, y: startY + spacing },
        };
        console.log('Creating trigger node:', triggerNode);
        newNodes.push(triggerNode);
      }
    } else {
      // For After: trigger first, then action
      if (triggerInputs[0].after) {
        const triggerNode = {
          id: `trigger-1`,
          type: NODE_TYPES.TRIGGER,
          content: triggerInputs[0].after,
          position: { x: centerX, y: startY },
        };
        console.log('Creating trigger node:', triggerNode);
        newNodes.push(triggerNode);
      }
      if (nextStep) {
        const actionNode = {
          id: `action-1`,
          type: NODE_TYPES.ACTION,  // Always use ACTION type for behavior nodes
          content: nextStep.replace(/^I will /, ''),
          position: { x: centerX, y: startY + spacing },
        };
        console.log('Creating action node:', actionNode);
        newNodes.push(actionNode);
      }
    }

    console.log('Final nodes before setting state:', newNodes);
    setNodes(newNodes);
    setCurrentStep('create_map');
  };

  // Add state restoration function
  const restoreState = () => {
    const savedStep = localStorage.getItem('triggerMapStep') as Step;
    const savedBehaviorTitle = localStorage.getItem('behaviorTitle');
    const savedBehavior = localStorage.getItem('behavior');
    const savedNextStep = localStorage.getItem('nextStep');
    const savedNodes = localStorage.getItem('nodes');
    const savedIsBeforeSelected = localStorage.getItem('isBeforeSelected');
    const savedTriggerInputs = localStorage.getItem('triggerInputs');

    if (savedStep || savedBehaviorTitle || savedBehavior || savedNextStep || savedNodes) {
      console.log('Restoring saved state');
      if (savedStep) setCurrentStep(savedStep);
      if (savedBehaviorTitle) setBehaviorTitle(savedBehaviorTitle);
      if (savedBehavior) setBehavior(JSON.parse(savedBehavior));
      if (savedNextStep) setNextStep(savedNextStep);
      if (savedNodes) {
        // Parse and validate nodes before setting state
        const parsedNodes = JSON.parse(savedNodes);
        const validatedNodes = parsedNodes.map((node: any) => {
          // Ensure the node type is valid
          let nodeType: NodeType = node.type;
          if (!Object.values(NODE_TYPES).includes(nodeType)) {
            nodeType = NODE_TYPES.ACTION;  // Default to ACTION for invalid types
          }
          
          return {
            ...node,
            type: nodeType,
          };
        });
        console.log('Restored and validated nodes:', validatedNodes);
        setNodes(validatedNodes);
      }
      if (savedIsBeforeSelected) setIsBeforeSelected(JSON.parse(savedIsBeforeSelected));
      if (savedTriggerInputs) setTriggerInputs(JSON.parse(savedTriggerInputs));
      return true;
    }
    return false;
  };

  // Update the useEffect that loads from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !stateLoaded && !hasAttemptedRestore.current) {
      console.log('Initial state restoration attempt');
      hasAttemptedRestore.current = true;
      const hasRestoredState = restoreState();
      if (hasRestoredState) {
        setStateLoaded(true);
      }
    }
  }, []); // Only run once on mount

  // Update the session effect
  useEffect(() => {
    console.log('Session updated:', session);
    
    // Only proceed if we have a valid session
    if (!session?.user) {
      console.log('No valid session, skipping state restoration');
      return;
    }

    // Check if we need to restore state
    const searchParams = new URLSearchParams(window.location.search);
    const hasTriggerMapState = searchParams.get('triggerMapState') === 'true';
    const pendingSave = localStorage.getItem('pendingSave') === 'true';

    console.log('State check:', { hasTriggerMapState, pendingSave, stateLoaded });

    // If we have a pending save and haven't loaded state yet, restore it
    if (pendingSave && !stateLoaded) {
      console.log('Attempting to restore state for pending save');
      const hasRestoredState = restoreState();
      if (hasRestoredState) {
        setStateLoaded(true);
        // Wait a bit to ensure state is updated before saving
        setTimeout(() => {
          console.log('Attempting to save after state restoration');
          handleSaveMap();
        }, 100);
      }
    }
  }, [session, stateLoaded]);

  const handleSaveMap = async () => {
    if (!session?.user) {
      console.log('No session, saving state and redirecting to sign in');
      // Save current state before redirecting
      localStorage.setItem('triggerMapStep', currentStep);
      localStorage.setItem('behaviorTitle', behaviorTitle);
      localStorage.setItem('behavior', JSON.stringify(behavior));
      localStorage.setItem('nextStep', nextStep);
      localStorage.setItem('nodes', JSON.stringify(nodes));
      localStorage.setItem('isBeforeSelected', JSON.stringify(isBeforeSelected));
      localStorage.setItem('triggerInputs', JSON.stringify(triggerInputs));
      localStorage.setItem('pendingSave', 'true');
      
      // Use signIn with proper callback URL
      const { signIn } = await import('next-auth/react');
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('triggerMapState', 'true');
      await signIn('google', { 
        callbackUrl: currentUrl.toString(),
        redirect: true
      });
      return;
    }

    console.log('Session exists, attempting to save');
    setIsSaving(true);
    setError(null);

    try {
      // Convert nodes to match database schema
      const dbNodes = transformNodesForSave(nodes);

      // Log the data we're about to send
      console.log('Saving map with data:', {
        goal: behaviorTitle,
        nodes: dbNodes
      });

      const response = await fetch('/api/trigger-maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: behaviorTitle,
          nodes: dbNodes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error response:', errorData);
        throw new Error(errorData.error || 'Failed to save trigger map');
      }

      const savedMap = await response.json();
      console.log('Successfully saved map:', savedMap);
      
      // Only clear storage after successful save
      clearStorage();
      
      // Remove the triggerMapState parameter before redirecting
      const redirectUrl = new URL('/maps', window.location.origin);
      window.location.href = redirectUrl.toString();
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save trigger map');
    } finally {
      setIsSaving(false);
    }
  };

  const transformNodesForSave = (nodes: TriggerMapNode[]) => {
    console.log('Original nodes:', nodes);
    console.log('Node types:', nodes.map(node => ({
      originalType: node.type,
      typeOf: typeof node.type,
      isString: typeof node.type === 'string',
      stringValue: String(node.type),
      nodeId: node.id,
      nodeContent: node.content
    })));
    
    const transformed = nodes.map((node, index) => {
      // Always use the node's type as is - it should already be correct
      const transformedNode = {
        content: node.content,
        type: node.type,
        order: index,
      };
      console.log('Transformed node:', transformedNode);
      return transformedNode;
    });
    
    console.log('Transformed nodes:', transformed);
    return transformed;
  };

  const handleTriggerInputChange = (id: string, field: keyof TriggerInput, value: string) => {
    setTriggerInputs(prev =>
      prev.map(trigger =>
        trigger.id === id ? { ...trigger, [field]: value } : trigger
      )
    );
  };

  useEffect(() => {
    localStorage.setItem('triggerMapStep', currentStep);
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('behaviorTitle', behaviorTitle);
  }, [behaviorTitle]);

  useEffect(() => {
    localStorage.setItem('behavior', JSON.stringify(behavior));
  }, [behavior]);

  useEffect(() => {
    localStorage.setItem('nextStep', nextStep);
  }, [nextStep]);

  useEffect(() => {
    localStorage.setItem('nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('isBeforeSelected', JSON.stringify(isBeforeSelected));
  }, [isBeforeSelected]);

  useEffect(() => {
    localStorage.setItem('triggerInputs', JSON.stringify(triggerInputs));
  }, [triggerInputs]);

  // Update the clearStorage function
  const clearStorage = () => {
    console.log('Clearing storage');
    localStorage.removeItem('triggerMapStep');
    localStorage.removeItem('behaviorTitle');
    localStorage.removeItem('behavior');
    localStorage.removeItem('nextStep');
    localStorage.removeItem('nodes');
    localStorage.removeItem('isBeforeSelected');
    localStorage.removeItem('triggerInputs');
    localStorage.removeItem('pendingSave');
    setStateLoaded(false);
    hasAttemptedRestore.current = false;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return; // Don't handle if user is typing in an input
      }

      switch (currentStep) {
        case 'has_next_step':
        case 'specific_enough':
          if (e.key.toLowerCase() === 'y') {
            e.preventDefault();
            currentStep === 'has_next_step' ? handleHasNextStep(true) : handleSpecificityCheck(true);
          } else if (e.key.toLowerCase() === 'n') {
            e.preventDefault();
            currentStep === 'has_next_step' ? handleHasNextStep(false) : handleSpecificityCheck(false);
          }
          break;
        case 'research':
          if (e.key === 'Enter') {
            e.preventDefault();
            handleResearchComplete();
          }
          break;
        case 'capture_behavior':
          if (e.key === 'Enter' && !e.shiftKey && nextStep.trim()) {
            e.preventDefault();
            handleBehaviorCapture(nextStep);
          }
          break;
        case 'breakdown':
          if (e.key === 'Enter' && !e.shiftKey && behavior.nextSteps.length > 0) {
            e.preventDefault();
            handleBreakdown(behavior.nextSteps);
          }
          break;
        case 'select_times':
          if (e.key === 'Enter' && triggerInputs[0][isBeforeSelected ? 'before' : 'after']) {
            e.preventDefault();
            handleCreateMap();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, nextStep, behavior.nextSteps, triggerInputs, isBeforeSelected]);

  const renderStep = () => {
    switch (currentStep) {
      case 'select_behavior':
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">What behavior or habit would you like to improve or experiment with?</h2>
            <textarea
              className="w-full p-4 border rounded-lg"
              rows={4}
              placeholder="Enter your behavior here..."
              value={behavior.content}
              onChange={(e) => {
                setBehavior(prev => ({ ...prev, content: e.target.value }));
                setBehaviorTitle(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && behavior.content.trim()) {
                  e.preventDefault();
                  handleBehaviorSelect(behavior.content);
                }
              }}
            />
            <button
              onClick={() => handleBehaviorSelect(behavior.content)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!behavior.content.trim()}
            >
              Continue
            </button>
          </div>
        );

      case 'has_next_step':
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">Do you have a clear next step identified?</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleHasNextStep(true)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Yes
              </button>
              <button
                onClick={() => handleHasNextStep(false)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                No
              </button>
            </div>
          </div>
        );

      case 'research':
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">Research Your Options</h2>
            <p className="text-gray-600">
              Spend up to 10 minutes researching your options using:
            </p>
            <ul className="list-none space-y-2">
              <li>YouTube tutorials</li>
              <li>Google search</li>
              <li>ChatGPT or other LLMs</li>
            </ul>
            <button
              onClick={handleResearchComplete}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              I've done my research
            </button>
          </div>
        );

      case 'capture_behavior':
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">What's your next step?</h2>
            <p className="text-gray-600">
              My next step to {behavior.content} is...
            </p>
            <textarea
              className="w-full p-4 border rounded-lg"
              rows={4}
              placeholder="Describe your next step..."
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && nextStep.trim()) {
                  e.preventDefault();
                  handleBehaviorCapture(nextStep);
                }
              }}
              autoFocus
            />
            <button
              onClick={() => handleBehaviorCapture(nextStep)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!nextStep.trim()}
            >
              Continue
            </button>
          </div>
        );

      case 'specific_enough':
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">Is this specific enough?</h2>
            <p className="text-gray-600">
              Could this be completed in less than 2 minutes?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSpecificityCheck(true)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Yes
              </button>
              <button
                onClick={() => handleSpecificityCheck(false)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                No
              </button>
            </div>
          </div>
        );

      case 'breakdown':
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">Let's break it down</h2>
            <p className="text-gray-600">
              What smaller steps could you take that would take less than 2 minutes?
            </p>
            <textarea
              className="w-full p-4 border rounded-lg"
              rows={4}
              placeholder="List your smaller steps..."
              value={behavior.nextSteps.join('\n')}
              onChange={(e) => setBehavior(prev => ({ ...prev, nextSteps: e.target.value.split('\n').filter(Boolean) }))}
            />
            <button
              onClick={() => handleBreakdown(behavior.nextSteps)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!behavior.nextSteps.length}
            >
              Continue
            </button>
          </div>
        );

      case 'select_times':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">When could you perform this?</h2>
            <p className="text-gray-600">
              Add specific times or situations when you could perform this behavior
            </p>
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="relative inline-flex items-center">
                    <span 
                      className={`mr-2 text-sm ${
                        isBeforeSelected 
                          ? 'font-bold text-[#E65C2E]' 
                          : 'font-normal text-gray-400'
                      }`}
                    >
                      Before I...
                    </span>
                    <div 
                      className="w-20 h-10 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out cursor-pointer"
                      onClick={() => setIsBeforeSelected(!isBeforeSelected)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') setIsBeforeSelected(true);
                        if (e.key === 'ArrowRight') setIsBeforeSelected(false);
                      }}
                      tabIndex={0}
                      role="switch"
                      aria-checked={!isBeforeSelected}
                    >
                      <div
                        className={`w-8 h-8 rounded-full shadow-md transform duration-300 ease-in-out ${
                          !isBeforeSelected ? 'translate-x-10 bg-blue-500' : 'bg-[#E65C2E]'
                        }`}
                      />
                    </div>
                    <span 
                      className={`ml-2 text-sm ${
                        !isBeforeSelected 
                          ? 'font-bold text-blue-500' 
                          : 'font-normal text-gray-400'
                      }`}
                    >
                      After I...
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="e.g., finish my morning coffee"
                    value={isBeforeSelected ? triggerInputs[0].before : triggerInputs[0].after}
                    onChange={(e) =>
                      handleTriggerInputChange(
                        triggerInputs[0].id,
                        isBeforeSelected ? 'before' : 'after',
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && triggerInputs[0][isBeforeSelected ? 'before' : 'after']) {
                        e.preventDefault();
                        handleCreateMap();
                      }
                    }}
                    autoFocus
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">I will...</span>
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded bg-gray-50"
                    value={nextStep}
                    disabled
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateMap}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!triggerInputs[0][isBeforeSelected ? 'before' : 'after']}
            >
              Create Trigger Map
            </button>
          </div>
        );

      case 'create_map':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Trigger Map Next Steps to...</h2>
              <div 
                className="text-xl font-medium text-blue-600 cursor-pointer"
                onClick={() => setEditingNodeId('title')}
              >
                {editingNodeId === 'title' ? (
                  <input
                    type="text"
                    className="text-center w-full bg-transparent border-b border-blue-300 focus:outline-none"
                    value={behaviorTitle}
                    onChange={(e) => setBehaviorTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        e.preventDefault();
                        setEditingNodeId(null);
                      }
                    }}
                    onBlur={() => setEditingNodeId(null)}
                    autoFocus
                  />
                ) : (
                  behaviorTitle
                )}
              </div>
            </div>
            <div className="relative w-full h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="relative">
                {nodes.length > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <button
                      onClick={() => handleAddNode(nodes[0].id, 'above')}
                      className="w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center z-10"
                    >
                      +
                    </button>
                  </div>
                )}
                {nodes.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <div className="relative mb-4">
                      <div
                        className={`relative p-4 rounded-lg shadow-lg bg-blue-100 min-w-[200px] text-center`}
                      >
                        {editingNodeId === node.id ? (
                          <input
                            type="text"
                            className="w-full bg-transparent border-none text-center focus:outline-none"
                            value={node.content}
                            onChange={(e) => {
                              const newContent = e.target.value;
                              setNodes(prev => prev.map(n => 
                                n.id === node.id ? { ...n, content: newContent } : n
                              ));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                handleNodeEdit(node.id, node.content);
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                handleNodeEdit(node.id, node.content);
                                saveButtonRef.current?.focus();
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div onClick={() => setEditingNodeId(node.id)}>
                            {node.content || 'Click to edit'}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < nodes.length - 1 && (
                      <div className="flex items-center justify-center mb-4">
                        <button
                          onClick={() => handleAddNode(node.id, 'below')}
                          className="w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center z-10"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                {nodes.length > 0 && (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleAddNode(nodes[nodes.length - 1].id, 'below')}
                      className="w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center z-10"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
            <button
              ref={saveButtonRef}
              onClick={handleSaveMap}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save Trigger Map'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {renderStep()}
    </div>
  );
} 