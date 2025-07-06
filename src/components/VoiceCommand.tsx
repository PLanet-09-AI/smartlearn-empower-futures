
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff } from "lucide-react";
import { voiceRecognition } from "@/utils/voiceRecognition";
import { toast } from "sonner";

interface VoiceCommandProps {
  onCommand?: (command: string) => void;
  commands?: { [key: string]: () => void };
  className?: string;
  size?: "default" | "sm" | "lg";
}

const VoiceCommand = ({ onCommand, commands = {}, className = "", size = "default" }: VoiceCommandProps) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");

  const defaultCommands = {
    // Navigation commands
    'overview': () => window.dispatchEvent(new CustomEvent('voice-navigate', { detail: 'overview' })),
    'courses': () => window.dispatchEvent(new CustomEvent('voice-navigate', { detail: 'courses' })),
    'browse courses': () => window.dispatchEvent(new CustomEvent('voice-navigate', { detail: 'courses' })),
    'course library': () => window.dispatchEvent(new CustomEvent('voice-navigate', { detail: 'courses' })),
    'management': () => window.dispatchEvent(new CustomEvent('voice-navigate', { detail: 'management' })),
    'manage courses': () => window.dispatchEvent(new CustomEvent('voice-navigate', { detail: 'management' })),
    'analytics': () => window.dispatchEvent(new CustomEvent('voice-navigate', { detail: 'analytics' })),
    
    // Button commands
    'continue': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'continue' })),
    'continue learning': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'continue' })),
    'create course': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'create-course' })),
    'new course': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'create-course' })),
    'save course': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'save-course' })),
    'add content': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'add-content' })),
    'add question': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'add-question' })),
    'publish course': () => window.dispatchEvent(new CustomEvent('voice-click', { detail: 'publish-course' })),
    
    // General commands
    'help': () => toast.info("Try saying: overview, courses, management, analytics, continue learning, create course, save course, add content, or publish course"),
    'what can I say': () => toast.info("Available commands: navigation (overview, courses, management), actions (continue learning, create course, save course), and general commands (help)"),
    
    ...commands
  };

  const handleVoiceCommand = () => {
    if (!voiceRecognition.isSupported()) {
      toast.error("Voice recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      voiceRecognition.stop();
      return;
    }

    const success = voiceRecognition.start({
      language: 'en-US',
      onResult: (transcript) => {
        const command = transcript.toLowerCase().trim();
        setLastCommand(transcript);
        
        // Check for specific commands
        let commandExecuted = false;
        for (const [keyword, action] of Object.entries(defaultCommands)) {
          if (command.includes(keyword.toLowerCase())) {
            action();
            commandExecuted = true;
            toast.success(`Voice command executed: ${keyword}`);
            break;
          }
        }

        if (!commandExecuted) {
          toast.info(`Voice command received: "${transcript}"`);
        }

        // Call custom command handler if provided
        onCommand?.(transcript);
      },
      onError: (error) => {
        toast.error(`Voice recognition error: ${error}`);
        setIsListening(false);
      },
      onStart: () => {
        setIsListening(true);
        toast.success("Voice recognition started - speak your command");
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (!success) {
      toast.error("Failed to start voice recognition");
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <Button
        onClick={handleVoiceCommand}
        variant={isListening ? "destructive" : "outline"}
        size={size}
        className="relative"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-2" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Voice Command
          </>
        )}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </Button>
      
      {lastCommand && (
        <Badge variant="secondary" className="text-xs max-w-xs truncate">
          "{lastCommand}"
        </Badge>
      )}
    </div>
  );
};

export default VoiceCommand;
