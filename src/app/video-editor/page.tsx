'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import VideoEditor from '@/components/video/VideoEditor';
import AIAssistant from '@/components/ai/AIAssistant';
import Button from '@/components/ui/Button';

export default function VideoEditorPage() {
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="flex gap-4 h-[calc(100vh-9rem)]">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Video Editor</h1>
            <p className="text-xs text-gray-500">Import clips, apply effects, and export your project</p>
          </div>
          <Button
            variant={showAI ? 'primary' : 'outline'}
            size="sm"
            icon={<MessageSquare className="w-4 h-4" />}
            onClick={() => setShowAI(v => !v)}
          >
            AI Assistant
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <VideoEditor />
        </div>
      </div>

      {showAI && (
        <div className="w-80 shrink-0">
          <AIAssistant
            context="User is working in the video editor"
            onClose={() => setShowAI(false)}
          />
        </div>
      )}
    </div>
  );
}
