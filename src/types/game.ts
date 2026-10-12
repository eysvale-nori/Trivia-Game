export interface Employee {
  id: string;
  name: string;
  department?: string;
  avatarColor?: string;
}

export interface QuestionItem {
  id: string;
  round: number; // 1, 2, 3, 4, or 0 for bonus
  number: number;
  question: string;
  answer: string;
  notes?: string;
}

export interface Match {
  id: string;
  round: number; // 1 (8 matches), 2 (4 matches), 3 (2 matches), 4 (1 match)
  matchNumber: number; // 1..8, 1..4, 1..2, 1
  contender1: Employee | null;
  contender2: Employee | null;
  winner: Employee | null;
  question: QuestionItem;
  bonusQuestionUsed?: QuestionItem | null;
  status: 'pending' | 'selecting' | 'ready' | 'in_progress' | 'completed';
}

export interface GameState {
  currentRound: number; // 1, 2, 3, 4
  currentMatchIndex: number; // 0-based index for matches in current round
  employees: Employee[]; // Full 16 employees master roster
  roundPools: Record<number, Employee[]>; // Remaining unselected employees in current round wheel
  matchesByRound: Record<number, Match[]>;
  prizes: {
    round1: string;
    round2: string;
    round3: string;
    round4: string;
  };
  soundEnabled: boolean;
  gameStatus: 'setup' | 'playing' | 'champion';
  champion: Employee | null;
}
