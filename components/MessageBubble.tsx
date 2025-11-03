
import React from 'react';
import { Message } from '../types';
import AnalysisCard from './AnalysisCard';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { sender, text, analysis } = message;

  const bubbleClasses = sender === 'user'
    ? 'bg-blue-500 text-white self-end'
    : 'bg-gray-200 text-gray-800 self-start';

  if (sender === 'system') {
    return (
        <div className="text-center text-sm text-gray-500 py-4 italic">
            {text}
        </div>
    );
  }

  return (
    <div className={`w-full flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-lg w-full">
            {sender === 'coach' && <p className="text-sm text-gray-500 ml-2 mb-1">NutriZen Coach</p>}
            <div className={`rounded-2xl p-4 shadow-sm ${bubbleClasses}`}>
              <p className="whitespace-pre-wrap">{text}</p>
            </div>
            {analysis && (
                <div className="mt-4">
                    <AnalysisCard analysis={analysis} />
                </div>
            )}
        </div>
    </div>
  );
};

export default MessageBubble;
