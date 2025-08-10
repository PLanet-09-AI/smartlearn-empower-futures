import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const AzureOpenAIStatus = () => {
  const [status, setStatus] = useState<'checking' | 'configured' | 'missing' | 'testing' | 'working' | 'failed'>('checking');
  const [details, setDetails] = useState<string>('');

  const checkConfiguration = () => {
    setStatus('checking');
    
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;

    if (!apiKey || !endpoint) {
      setStatus('missing');
      setDetails('Missing API key or endpoint URL. Please check your .env file.');
      return;
    }

    if (!endpoint.includes('.openai.azure.com')) {
      setStatus('missing');
      setDetails('Invalid endpoint format. Should be: https://your-resource-name.openai.azure.com/');
      return;
    }

    setStatus('configured');
    setDetails(`Ready to use deployment: ${deploymentName || 'gpt-4o-mini'}`);
  };

  const testConnection = async () => {
    setStatus('testing');
    setDetails('Testing connection to Azure OpenAI...');

    try {
      // Import the service dynamically to avoid issues
      const { azureOpenAIService } = await import('@/services/azureOpenAIService');
      
      const response = await azureOpenAIService.generateText([
        { role: 'user', content: 'Reply with exactly: "Connection test successful"' }
      ]);

      if (response.includes('Connection test successful')) {
        setStatus('working');
        setDetails('Azure OpenAI is working correctly!');
      } else if (response.includes('mock response') || response.includes('unable to generate')) {
        setStatus('failed');
        setDetails('Using mock responses. Check your Azure OpenAI configuration.');
      } else {
        setStatus('working');
        setDetails('Azure OpenAI responded (may be working)');
      }
    } catch (error) {
      setStatus('failed');
      setDetails(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return { icon: RefreshCw, color: 'text-blue-500', label: 'Checking...', variant: 'secondary' as const };
      case 'configured':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Configured', variant: 'outline' as const };
      case 'missing':
        return { icon: XCircle, color: 'text-red-500', label: 'Not Configured', variant: 'destructive' as const };
      case 'testing':
        return { icon: RefreshCw, color: 'text-blue-500', label: 'Testing...', variant: 'secondary' as const };
      case 'working':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Working', variant: 'default' as const };
      case 'failed':
        return { icon: AlertCircle, color: 'text-orange-500', label: 'Failed', variant: 'destructive' as const };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${statusInfo.color} ${status === 'checking' || status === 'testing' ? 'animate-spin' : ''}`} />
          Azure OpenAI Status
        </CardTitle>
        <CardDescription>
          Configuration and connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        
        <p className="text-sm text-gray-600">{details}</p>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={checkConfiguration}>
            Recheck Config
          </Button>
          {status !== 'missing' && status !== 'checking' && (
            <Button 
              size="sm" 
              onClick={testConnection} 
              disabled={status === 'testing'}
            >
              {status === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
          )}
        </div>

        {status === 'missing' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 font-medium">Setup Required:</p>
            <ol className="text-xs text-yellow-700 mt-1 list-decimal list-inside space-y-1">
              <li>Add your API key to .env file</li>
              <li>Add your endpoint URL to .env file</li>
              <li>Restart the development server</li>
            </ol>
            <p className="text-xs text-yellow-600 mt-2">
              See AZURE_OPENAI_SETUP.md for detailed instructions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AzureOpenAIStatus;
