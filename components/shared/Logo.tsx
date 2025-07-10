
import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { cn } from '../../lib/utils';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrainCircuit className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold text-primary">QuizPlatform</span>
    </div>
  );
};

export default Logo;
