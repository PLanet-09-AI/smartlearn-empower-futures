/**
 * Environment Configuration Checker
 * Validates OpenAI and other environment variables
 */

interface EnvironmentConfig {
  openAI: {
    isConfigured: boolean;
    apiKey: string;
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
    openAI: {
      isConfigured: false,
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
    },
    firebase: {
      isConfigured: false,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    }
  };

  // Check if OpenAI is configured
  config.openAI.isConfigured = !!config.openAI.apiKey;

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
  
  // OpenAI Status
  if (config.openAI.isConfigured) {
    console.log('✅ OpenAI: Configured');
    console.log(`   � Model: ${config.openAI.model}`);
    console.log(`   � API Key: ${config.openAI.apiKey ? '[REDACTED]' : 'Not set'}`);
  } else {
    console.log('❌ OpenAI: Not Configured');
    if (!config.openAI.apiKey) {
      console.log('   🔑 Missing: VITE_OPENAI_API_KEY');
    }
    console.log('   � Add your OpenAI API key to .env.development.local');
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
