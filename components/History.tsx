import React from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';

interface HistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 h-full">
      <div className="flex items-center">
        <HistoryIcon className="w-6 h-6 text-brand-green-dark" />
        <h3 className="ml-2 text-xl font-bold text-brand-gray-dark">Diagnosis History</h3>
      </div>
      {history.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-brand-gray">No diagnoses yet. Your past analyses will show up here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center p-3 rounded-lg hover:bg-brand-gray-light cursor-pointer transition-colors"
            >
              <img
                src={item.image}
                alt={item.disease}
                className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-gray-200"
              />
              <div className="ml-4 truncate">
                <p className="font-semibold text-brand-gray-dark truncate">{item.plantName}</p>
                <p className="text-sm text-brand-gray truncate">{item.disease}</p>
                <p className="text-xs text-brand-gray mt-1">{formatDate(item.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
