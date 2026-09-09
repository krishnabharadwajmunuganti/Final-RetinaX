import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { ScreeningContextData } from './types';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  context?: ScreeningContextData | null;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  context,
}) => {
  const baseQuestions = [
    'What is diabetic retinopathy?',
    'What does Grade 2 mean?',
    'What is Grad-CAM?',
    'What are retinal lesions?',
  ];

  // If screening context is present, add contextual suggestions
  const contextualQuestions: string[] = [];
  if (context) {
    contextualQuestions.push('Explain this screening report');
    if (context.leftEye && context.rightEye) {
      contextualQuestions.push('What is the difference between left and right eye results?');
    }
    if (context.leftEye?.lesions?.length || context.rightEye?.lesions?.length) {
      contextualQuestions.push('Explain the lesions detected in this screening');
    }
  }

  const questionsToShow = [...contextualQuestions, ...baseQuestions].slice(0, 5);

  return (
    <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/80">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
        <span>Suggested Questions</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {questionsToShow.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuestion(q)}
            className="whitespace-nowrap text-xs bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
