export interface Diagnosis {
  plantName: string;
  disease: string;
  description: string;
  treatment: string;
}

export interface HistoryItem extends Diagnosis {
  id: string;
  image: string; // base64 string
  date: string; // ISO string
  language: 'en' | 'ur';
}
