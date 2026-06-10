export interface Interview {
  id: string;
  role: string;
  difficulty: string;
  status: string;
  created_at: string;
}

export interface NextQuestion {
  completed: boolean;
  id?: string;
  text?: string;
  order?: number;
  number?: number;
  total?: number;
}

export interface ScoreOut {
  question_id: string;
  score: number;
  max_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ResultOut {
  interview_id: string;
  role: string;
  difficulty: string;
  overall_score: number;
  max_score: number;
  summary: string;
  scores: ScoreOut[];
}
