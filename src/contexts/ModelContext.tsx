import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModelContextType {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};

// Common Ollama models that users might have (fallback only)
const FALLBACK_MODELS = [
  'gpt-oss:20b'
];

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    // Load from localStorage or default to gpt-oss:20b
    return localStorage.getItem('ollama_selected_model') || 'gpt-oss:20b';
  });
  
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Fetch available models from Ollama API
  const fetchAvailableModels = async () => {
    try {
      console.log('🔍 Fetching available Ollama models...');
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((model: any) => model.name) || [];
        console.log('📦 Found Ollama models:', models);
        
        if (models.length > 0) {
          // Add custom option to the fetched models
          const modelsWithCustom = [...models, 'custom'];
          setAvailableModels(modelsWithCustom);
          
          // If current selected model is not in the list, set to first available
          if (!models.includes(selectedModel) && selectedModel !== 'custom') {
            const newModel = models[0];
            setSelectedModelState(newModel);
            localStorage.setItem('ollama_selected_model', newModel);
            console.log(`🔄 Switched to available model: ${newModel}`);
          }
        } else {
          console.warn('⚠️ No models found in Ollama');
          setAvailableModels(['custom']);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn('❌ Could not fetch Ollama models:', error);
      console.log('📋 Using fallback models');
      // Use fallback models if fetch fails
      setAvailableModels([...FALLBACK_MODELS, 'custom']);
    }
  };

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    localStorage.setItem('ollama_selected_model', model);
  };

  const value: ModelContextType = {
    selectedModel,
    setSelectedModel,
    availableModels
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};