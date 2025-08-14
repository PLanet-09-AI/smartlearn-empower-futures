/**
 * Environment Configuration Checker
 * Validates OpenAI and other environment variables
 */


interface EnvironmentConfig {
  ollama: {
    isConfigured: boolean;
    endpoint: string;
    model: string;
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
    ollama: {
      endpoint: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434/api/generate',
      model: import.meta.env.VITE_OLLAMA_MODEL || 'gpt-oss:20b',
      isConfigured: false,
    },
    firebase: {
      isConfigured: false,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    }
  };

  // Validate Ollama (basic check: endpoint and model must be set)
  config.ollama.isConfigured = !!(config.ollama.endpoint && config.ollama.model);

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

  // Ollama Status
  if (config.ollama.isConfigured) {
    console.log('✅ Ollama: Configured');
    console.log(`   🌐 Endpoint: ${config.ollama.endpoint}`);
    console.log(`   🤖 Model: ${config.ollama.model}`);
  } else {
    console.log('❌ Ollama: Not Configured');
    console.log('   🌐 Set VITE_OLLAMA_URL and VITE_OLLAMA_MODEL in your environment');
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
