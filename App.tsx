import React, { useState, useEffect, useCallback } from 'react';
import { Diagnosis, HistoryItem } from './types';
import { diagnosePlant } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import DiagnosisResult from './components/DiagnosisResult';
import History from './components/History';
import { LeafIcon } from './components/icons/LeafIcon';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('plantHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('plantHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);

  const handleImageSelect = (file: File) => {
    setError(null);
    setDiagnosis(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.onerror = () => {
        setError("Failed to read the image file. Please try another one.");
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = useCallback(async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const result = await diagnosePlant(image, language);
      setDiagnosis(result);
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        image,
        date: new Date().toISOString(),
        language,
        ...result,
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory.slice(0, 9)]); // Keep last 10
    } catch (e) {
      console.error(e);
      setError("Sorry, I couldn't diagnose the plant. The AI model might be unavailable or the image couldn't be processed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [image, language]);

  const handleReset = () => {
    setImage(null);
    setDiagnosis(null);
    setError(null);
    setIsLoading(false);
  };
  
  const handleHistorySelect = (item: HistoryItem) => {
    setImage(item.image);
    setDiagnosis({
        plantName: item.plantName,
        disease: item.disease,
        description: item.description,
        treatment: item.treatment
    });
    setLanguage(item.language);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-brand-gray-light font-sans text-brand-gray-dark">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-gray-dark">Get an Instant Diagnosis</h2>
                    <p className="text-brand-gray mt-2">Upload a photo of a plant leaf to identify the plant, its diseases, and get treatment advice.</p>
                </div>
                {!diagnosis && <ImageUploader onImageSelect={handleImageSelect} image={image} onDiagnose={handleDiagnose} isLoading={isLoading} onReset={handleReset}/>}
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4">
                        <LeafIcon className="w-16 h-16 text-brand-green animate-spin" />
                        <p className="text-lg font-medium text-brand-green-dark">Analyzing your plant...</p>
                    </div>
                )}

                {error && !isLoading && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
                
                {diagnosis && !isLoading && <DiagnosisResult diagnosis={diagnosis} onReset={handleReset} image={image} language={language} />}
            </div>
          </div>

          <div className="lg:col-span-1">
            <History history={history} onSelect={handleHistorySelect} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
