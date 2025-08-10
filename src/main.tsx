import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import environment checker for development
import './utils/environmentChecker'

createRoot(document.getElementById("root")!).render(<App />);
