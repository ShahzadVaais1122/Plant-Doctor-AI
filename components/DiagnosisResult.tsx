import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Diagnosis } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ResetIcon } from './icons/ResetIcon';
import { TagIcon } from './icons/TagIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { StopIcon } from './icons/StopIcon';
import { GlobeIcon } from './icons/GlobeIcon';


interface DiagnosisResultProps {
  diagnosis: Diagnosis;
  image: string | null;
  onReset: () => void;
  language: 'en' | 'ur';
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, image, onReset, language }) => {
  const isHealthy = diagnosis.disease.toLowerCase() === 'healthy' || diagnosis.disease === 'صحت مند';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        const targetLang = language === 'ur' ? 'ur' : 'en';

        // Find the best matching voice for the current language
        const bestVoice = 
            availableVoices.find(voice => voice.lang.startsWith(targetLang)) || 
            availableVoices.find(v => v.lang.startsWith('en')) || 
            availableVoices[0];
        
        setSelectedVoice(bestVoice);
      }
    };
    
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language]);


  const cleanTextForSpeech = (text: string) => text.replace(/(\* |- )/g, '. ');

  const handleStop = useCallback(() => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }
  }, []);

  useEffect(() => {
    if (diagnosis && 'speechSynthesis' in window && selectedVoice) {
      handleStop(); 

      let textToSpeak: string;

      if (language === 'ur') {
        textToSpeak = `
          پودے کی شناخت ${diagnosis.plantName} کے طور پر ہوئی۔
          تشخیص: ${diagnosis.disease}।
          ${cleanTextForSpeech(diagnosis.description)}
          علاج کا منصوبہ: ${cleanTextForSpeech(diagnosis.treatment)}
        `;
      } else {
        textToSpeak = `
          Plant identified as ${diagnosis.plantName}.
          Diagnosis: ${diagnosis.disease}.
          ${cleanTextForSpeech(diagnosis.description)}.
          Treatment Plan: ${cleanTextForSpeech(diagnosis.treatment)}.
        `;
      }
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
      };
      utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          utteranceRef.current = null;
      };
      utterance.onerror = (e) => {
          setIsSpeaking(false);
          setIsPaused(false);
          console.error("Speech synthesis error", e);
      };

      utteranceRef.current = utterance;
      // A small delay can help ensure the voice is set before speaking
      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
    }

    return () => {
        handleStop();
    };
  }, [diagnosis, selectedVoice, handleStop, language]);

  const handlePlayPause = () => {
    if (!window.speechSynthesis) return;

    if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
    } else if (isSpeaking) {
        window.speechSynthesis.pause();
        setIsPaused(true);
    } else if (utteranceRef.current) {
        window.speechSynthesis.speak(utteranceRef.current);
    }
  };
  
  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = event.target.value;
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
        setSelectedVoice(voice);
    }
  };

  const formatText = (text: string) => {
    return text.split(/(\* |- )/).filter(part => part.trim() !== '' && part !== '*' && part !== '-').map((line, index) => {
        if (text.includes('*') || text.includes('-')) {
             return (
                <li key={index} className="flex items-start">
                    <span className="text-brand-green mr-2 mt-1">&#10003;</span>
                    <span>{line}</span>
                </li>
             );
        }
        return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
       {image && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-inner border border-gray-200">
             <img src={image} alt="Diagnosed plant leaf" className="w-full h-full object-contain" />
          </div>
       )}

      <div className="p-6 rounded-lg bg-indigo-50 border-indigo-200 border">
        <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-indigo-500"/>
            <h3 className="ml-3 text-2xl font-bold text-brand-gray-dark" dir={language === 'ur' ? 'rtl' : 'ltr'}>{diagnosis.plantName}</h3>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
        <div className="flex items-center">
            {isHealthy ? <CheckCircleIcon className="h-8 w-8 text-green-500"/> : <AlertTriangleIcon className="h-8 w-8 text-yellow-600"/>}
            <h3 className="ml-3 text-2xl font-bold text-brand-gray-dark" dir={language === 'ur' ? 'rtl' : 'ltr'}>{diagnosis.disease}</h3>
        </div>
        <div className="mt-4 text-brand-gray prose prose-sm max-w-none" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {formatText(diagnosis.description)}
        </div>
      </div>
      
      <div className="p-6 rounded-lg bg-brand-green-light border-brand-green-dark/20 border">
          <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-brand-green-dark"/>
              <h3 className="ml-3 text-2xl font-bold text-brand-green-dark">
                {language === 'ur' ? 'علاج کا منصوبہ' : 'Treatment Plan'}
              </h3>
            </div>
            {'speechSynthesis' in window && voices.length > 0 && (
                 <div className="flex items-center gap-2 flex-wrap justify-end">
                    <div className="relative flex items-center">
                        <GlobeIcon className="w-5 h-5 text-brand-green-dark absolute left-3 pointer-events-none" />
                        <select
                            value={selectedVoice?.name || ''}
                            onChange={handleVoiceChange}
                            className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full bg-white text-brand-gray-dark focus:outline-none focus:ring-2 focus:ring-brand-green appearance-none"
                            aria-label="Select voice"
                        >
                        {voices.map(voice => (
                          <option key={voice.name} value={voice.name}>
                            {`${voice.name} (${voice.lang})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-1 p-1 bg-white/60 rounded-full">
                        <button onClick={handlePlayPause} title={isPaused ? "Resume" : (isSpeaking ? "Pause" : "Play")} className="p-2 rounded-full hover:bg-white transition-colors">
                            {isSpeaking && !isPaused ? <PauseIcon className="w-5 h-5 text-brand-green-dark" /> : <PlayIcon className="w-5 h-5 text-brand-green-dark" />}
                        </button>
                        <button onClick={handleStop} title="Stop" disabled={!isSpeaking} className="p-2 rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <StopIcon className="w-5 h-5 text-brand-green-dark" />
                        </button>
                    </div>
                </div>
            )}
          </div>
          <div className="mt-4 text-brand-gray-dark prose prose-sm max-w-none" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <ul className="space-y-2 list-none p-0">{formatText(diagnosis.treatment)}</ul>
          </div>
      </div>

      <button
          onClick={onReset}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-brand-gray-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors"
        >
          <ResetIcon className="w-5 h-5 mr-2 -ml-1" />
          {language === 'ur' ? 'ایک اور پودے کی تشخیص کریں۔' : 'Diagnose Another Plant'}
      </button>
    </div>
  );
};

export default DiagnosisResult;