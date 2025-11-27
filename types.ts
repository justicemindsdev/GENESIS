export interface ClipData {
  id: string;
  category: string;
  description: string;
  timestamp: string;
  url: string;
  notes?: string;
}

export interface CategoryGroup {
  name: string;
  clips: ClipData[];
}