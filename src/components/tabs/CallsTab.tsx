import React from 'react';
import { Phone, Video } from 'lucide-react';

const CallsTab: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="flex gap-6 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Phone className="h-10 w-10 text-primary" />
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
          <Video className="h-10 w-10 text-accent" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-center mb-2">
        Voice & Video Calls
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-md">
        Coming Soon
      </p>
      <p className="mt-4 text-sm text-muted-foreground/70 text-center max-w-md">
        We're working on bringing you high-quality voice and video calling features. 
        Stay tuned for updates!
      </p>
    </div>
  );
};

export default CallsTab;
