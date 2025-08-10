# Azure OpenAI Setup Guide for SmartLearn

## 🚀 Quick Setup

You mentioned you have an API key. Here's what you need to provide for the Azure OpenAI integration to work:

### Required Information

1. **API Key** ✅ (You have this)
2. **Endpoint URL** ❓ (Need this)
3. **Deployment Name** ❓ (Need this)

### Where to Find Missing Information

#### 1. Azure OpenAI Endpoint URL
- Go to [Azure Portal](https://portal.azure.com)
- Navigate to your Azure OpenAI resource
- In the **Overview** section, find **Endpoint**
- It should look like: `https://your-resource-name.openai.azure.com/`

#### 2. Deployment Name
- In your Azure OpenAI resource, go to **Model deployments**
- You should see your deployed model (likely GPT-4o-mini or similar)
- Copy the **Deployment name** (not the model name)

## 🔧 Configuration Steps

### Step 1: Update Environment Variables

Open your `.env` file and add these values:

```env
# Replace with your actual values
VITE_AZURE_OPENAI_API_KEY=your_actual_api_key_here
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name_here
```

### Step 2: Restart Development Server

After updating the `.env` file:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

## 🧪 Testing the Integration

### Method 1: Check Browser Console
1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Try generating a quiz
5. Look for these messages:
   - ✅ `Azure OpenAI configuration validated successfully`
   - 🚀 `Using deployment: your-deployment-name`
   - 🤖 `Calling Azure OpenAI API...`
   - ✅ `Azure OpenAI API call successful`

### Method 2: Generate a Quiz
1. Go to any course
2. Click on "Content Quiz" tab
3. Click "Generate Content Quiz"
4. If working correctly, you'll see real AI-generated questions instead of mock data

## 🔍 Troubleshooting

### Common Issues & Solutions

#### ❌ "Authentication failed"
- **Problem**: Invalid API key
- **Solution**: Double-check your API key in the `.env` file

#### ❌ "Deployment not found"
- **Problem**: Wrong deployment name or endpoint
- **Solution**: Verify deployment name in Azure Portal

#### ❌ "Network error"
- **Problem**: Wrong endpoint URL format
- **Solution**: Ensure endpoint ends with `.openai.azure.com/`

#### 🔄 "Using mock response"
- **Problem**: Configuration issue or API error
- **Solution**: Check console for specific error messages

## 📊 What You'll See When Working

### Before Configuration (Mock Data):
- Generic quiz questions about React/accounting
- Same questions every time
- Console warning about missing credentials

### After Configuration (Real AI):
- Questions based on actual course content
- Different questions each time
- Contextual to your specific course materials
- Better explanations and varied difficulty

## 🎯 Benefits of Real AI Integration

1. **Content-Aware Quizzes**: Questions generated from actual course material
2. **Unique Every Time**: No repeated questions
3. **Adaptive Difficulty**: Matches course complexity
4. **Better Learning**: More relevant and educational questions
5. **Scalable**: Works for any course content automatically

## 🔒 Security Notes

- Keep your API key secure and never commit it to version control
- The `.env` file is already in `.gitignore`
- API calls are made client-side (consider server-side for production)

## 💰 Cost Considerations

- Azure OpenAI charges per token (input + output)
- Quiz generation typically uses 500-2000 tokens per request
- Monitor usage in Azure Portal
- Consider implementing rate limiting for production

## 🛠️ Advanced Configuration

### Custom API Version
```env
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Different Models
You can deploy different models in Azure and switch between them:
```env
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-turbo
```

---

## ❓ What I Need From You

Please provide:

1. **Your Azure OpenAI Endpoint URL**
   - Format: `https://your-resource-name.openai.azure.com/`

2. **Your Deployment Name**
   - Found in Azure Portal > Your OpenAI Resource > Model deployments

3. **Confirm your API Key is correct**
   - You can test it manually if needed

Once you provide these, I'll help you configure everything properly!
