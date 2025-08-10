/**
 * Environment Configuration Checker
 * Validates Azure OpenAI and other environment variables
 */

interface EnvironmentConfig {
  azureOpenAI: {
    isConfigured: boolean;
    apiKey: string;
    endpoint: string;
    deploymentName: string;
    apiVersion: string;
  };
  firebase: {
    isConfigured: boolean;
    apiKey: string;
    authDomain: string;
    projectId: string;
  };
}

export function validateEnvironment(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    azureOpenAI: {
      isConfigured: false,
      apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
      endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
      deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini',
      apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2023-05-15',
    },
    firebase: {
      isConfigured: false,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    }
  };

  // Validate Azure OpenAI
  config.azureOpenAI.isConfigured = !!(
    config.azureOpenAI.apiKey && 
    config.azureOpenAI.endpoint &&
    config.azureOpenAI.endpoint.includes('.openai.azure.com')
  );

  // Validate Firebase (basic check)
  config.firebase.isConfigured = !!(
    config.firebase.apiKey && 
    config.firebase.authDomain && 
    config.firebase.projectId
  );

  return config;
}

export function logEnvironmentStatus(): void {
  const config = validateEnvironment();
  
  console.log('🔧 Environment Configuration Status:');
  console.log('=====================================');
  
  // Azure OpenAI Status
  if (config.azureOpenAI.isConfigured) {
    console.log('✅ Azure OpenAI: Configured');
    console.log(`   📍 Endpoint: ${config.azureOpenAI.endpoint}`);
    console.log(`   🚀 Deployment: ${config.azureOpenAI.deploymentName}`);
    console.log(`   📝 API Version: ${config.azureOpenAI.apiVersion}`);
  } else {
    console.log('❌ Azure OpenAI: Not Configured');
    if (!config.azureOpenAI.apiKey) {
      console.log('   🔑 Missing: VITE_AZURE_OPENAI_API_KEY');
    }
    if (!config.azureOpenAI.endpoint) {
      console.log('   🔗 Missing: VITE_AZURE_OPENAI_ENDPOINT');
    }
    console.log('   📖 See AZURE_OPENAI_SETUP.md for configuration help');
  }
  
  // Firebase Status
  if (config.firebase.isConfigured) {
    console.log('✅ Firebase: Configured');
  } else {
    console.log('❌ Firebase: Not Configured');
  }
  
  console.log('=====================================');
}

// Auto-run on import in development
if (import.meta.env.MODE === 'development') {
  logEnvironmentStatus();
}
