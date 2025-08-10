import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { azureOpenAIService } from '@/services/azureOpenAIService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AzureOpenAITester = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    response?: string;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const testMessages = [
        { role: 'system' as const, content: 'You are a helpful assistant.' },
        { role: 'user' as const, content: 'Say "Azure OpenAI is working correctly!" and provide a brief explanation of what you are.' }
      ];

      const response = await azureOpenAIService.generateText(testMessages);
      
      // Check if it's a mock response
      const isMockResponse = response.includes('mock response') || response.includes('I\'m unable to generate');
      
      setResult({
        success: !isMockResponse,
        message: isMockResponse 
          ? 'Connection failed - using mock response. Please check your Azure OpenAI configuration.'
          : 'Azure OpenAI is working correctly!',
        response
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 Azure OpenAI Connection Test
        </CardTitle>
        <CardDescription>
          Test your Azure OpenAI configuration to ensure quiz generation will work properly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Azure OpenAI Connection'
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="font-medium mb-2">{result.message}</div>
                {result.response && (
                  <div className="text-sm bg-gray-50 p-3 rounded-md mt-2">
                    <strong>Response:</strong>
                    <div className="mt-1 whitespace-pre-wrap">{result.response}</div>
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Sends a test request to your Azure OpenAI endpoint</li>
            <li>Verifies your API key and deployment are working</li>
            <li>Confirms the response is from Azure OpenAI (not mock data)</li>
          </ul>
          
          <p className="mt-4"><strong>If the test fails:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Check the browser console for detailed error messages</li>
            <li>Verify your .env file has the correct values</li>
            <li>Refer to AZURE_OPENAI_SETUP.md for configuration help</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AzureOpenAITester;
