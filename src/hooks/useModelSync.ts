import { useEffect } from 'react';
import { useModel } from '@/contexts/ModelContext';
import { azureOpenAIService } from '@/services/azureOpenAI';

/**
 * Hook that automatically syncs the selected Ollama model with the service
 * This ensures that when users change the model in the UI, all AI operations use the new model
 */
export const useModelSync = () => {
  const { selectedModel } = useModel();

  useEffect(() => {
    // Sync the selected model with the service whenever it changes
    azureOpenAIService.setModel(selectedModel);
    console.log(`🔄 Model synced: ${selectedModel}`);
  }, [selectedModel]);

  return { selectedModel };
};
