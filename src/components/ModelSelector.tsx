import React, { useState } from 'react';
import { useModel } from '@/contexts/ModelContext';
import { azureOpenAIService } from '@/services/azureOpenAI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings, AlertCircle, CheckCircle, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel, availableModels } = useModel();
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const [isTestingModel, setIsTestingModel] = useState(false);
  const { toast } = useToast();

  const handleModelChange = (model: string) => {
    if (model === 'custom') {
      setIsCustomDialogOpen(true);
      return;
    }
    
    setSelectedModel(model);
    azureOpenAIService.setModel(model);
  };

  const handleCustomModelSubmit = () => {
    if (customModel.trim()) {
      setSelectedModel(customModel.trim());
      azureOpenAIService.setModel(customModel.trim());
      setIsCustomDialogOpen(false);
      setCustomModel('');
    }
  };

  const testCurrentModel = async () => {
    setIsTestingModel(true);
    try {
      const result = await azureOpenAIService.testModel(selectedModel);
      
      if (result.success) {
        toast({
          title: "✅ Model Test Successful",
          description: `${selectedModel} responded in ${result.responseTime}ms`,
        });
      } else {
        toast({
          title: "❌ Model Test Failed",
          description: `${selectedModel}: ${result.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Model Test Error",
        description: "Could not test model connectivity",
        variant: "destructive"
      });
    } finally {
      setIsTestingModel(false);
    }
  };

  const getModelDisplayName = (model: string) => {
    // Format model names for better display
    if (model.includes(':')) {
      const [name, version] = model.split(':');
      return `${name} (${version})`;
    }
    return model;
  };

  // Check if we have actual models or just fallback
  const hasRealModels = availableModels.length > 1 || (availableModels.length === 1 && availableModels[0] !== 'custom');

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <Bot className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">Model:</span>
      </div>
      
      {!hasRealModels ? (
        <div className="flex items-center space-x-1">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-amber-600">Ollama offline</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomDialogOpen(true)}
            className="h-6 text-xs px-2"
          >
            Use Custom
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {getModelDisplayName(selectedModel)}
                  </Badge>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  <div className="flex items-center justify-between w-full">
                    <span>{getModelDisplayName(model)}</span>
                    {model === 'custom' && <Settings className="h-3 w-3 ml-2" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={testCurrentModel}
            disabled={isTestingModel}
            className="h-6 w-6 p-0"
            title="Test model connectivity"
          >
            {isTestingModel ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
            ) : (
              <TestTube className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}

      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Custom Ollama Model</DialogTitle>
            <DialogDescription>
              Enter the name of your custom Ollama model (e.g., "my-model:latest").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!hasRealModels && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ollama server appears to be offline. Make sure Ollama is running on localhost:11434.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="custom-model">Model Name</Label>
              <Input
                id="custom-model"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="model-name:tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomModelSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCustomDialogOpen(false);
                  setCustomModel('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCustomModelSubmit} disabled={!customModel.trim()}>
                Use Model
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelSelector;
