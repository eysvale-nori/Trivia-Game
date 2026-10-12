import { QuestionItem, Employee } from '../types/game';

export const ROUND_QUESTIONS: Record<number, QuestionItem[]> = {
  1: [
    {
      id: 'r1-q1',
      round: 1,
      number: 1,
      question: 'What do you call the habit of consistently arriving at work on time?',
      answer: 'Punctuality',
    },
    {
      id: 'r1-q2',
      round: 1,
      number: 2,
      question: "An employee's shift starts at 9:00 PM, but they arrive at 9:05 PM. What is this called?",
      answer: 'Tardiness',
    },
    {
      id: 'r1-q3',
      round: 1,
      number: 3,
      question: 'What is the term for maintaining a healthy balance between professional responsibilities and personal life?',
      answer: 'Work-Life Balance',
    },
    {
      id: 'r1-q4',
      round: 1,
      number: 4,
      question: 'An employee works beyond their scheduled shift. What is this called?',
      answer: 'Overtime',
    },
    {
      id: 'r1-q5',
      round: 1,
      number: 5,
      question: 'What do you call the practice of arranging tasks from most important to least important?',
      answer: 'Prioritization',
    },
    {
      id: 'r1-q6',
      round: 1,
      number: 6,
      question: 'What is the term for postponing important tasks even when you have time to complete them?',
      answer: 'Procrastination',
    },
    {
      id: 'r1-q7',
      round: 1,
      number: 7,
      question: "What do you call an employee's failure to report for scheduled work without authorization?",
      answer: 'Absenteeism',
    },
    {
      id: 'r1-q8',
      round: 1,
      number: 8,
      question: 'What is the term for doing a task using the least possible time and resources without sacrificing the required quality?',
      answer: 'Efficiency',
    },
  ],
  2: [
    {
      id: 'r2-q1',
      round: 2,
      number: 1,
      question: 'What do you call people working together toward a common goal?',
      answer: 'Collaboration',
    },
    {
      id: 'r2-q2',
      round: 2,
      number: 2,
      question: 'What do you call information exchanged between coworkers to coordinate their work?',
      answer: 'Communication',
    },
    {
      id: 'r2-q3',
      round: 2,
      number: 3,
      question: "What is the ability to understand another person's feelings and perspective?",
      answer: 'Empathy',
    },
    {
      id: 'r2-q4',
      round: 2,
      number: 4,
      question: "What is the ability to listen carefully and understand another person's message?",
      answer: 'Listening',
    },
  ],
  3: [
    {
      id: 'r3-q1',
      round: 3,
      number: 1,
      question: 'What do you call the quality of accepting responsibility for your actions and decisions?',
      answer: 'Accountability',
    },
    {
      id: 'r3-q2',
      round: 3,
      number: 2,
      question: 'An employee admits a mistake instead of blaming others. What leadership quality does this demonstrate?',
      answer: 'Integrity',
    },
  ],
  4: [
    {
      id: 'r4-q1',
      round: 4,
      number: 1,
      question: 'What is the process of comparing actual results with planned targets called?',
      answer: 'Evaluation',
    },
  ],
};

export const BONUS_QUESTIONS: QuestionItem[] = [
  {
    id: 'bonus-1',
    round: 0,
    number: 1,
    question: 'What is the term for an employee taking action proactively without waiting to be told?',
    answer: 'Initiative',
    notes: 'Bonus Question for Host',
  },
  {
    id: 'bonus-2',
    round: 0,
    number: 2,
    question: 'What do you call the practice of guiding, mentoring, and inspiring team members?',
    answer: 'Leadership',
    notes: 'Bonus Question for Host',
  },
  {
    id: 'bonus-3',
    round: 0,
    number: 3,
    question: 'What is the capacity to quickly adapt and bounce back from workplace challenges?',
    answer: 'Resilience',
    notes: 'Bonus Question for Host',
  },
  {
    id: 'bonus-4',
    round: 0,
    number: 4,
    question: 'What do you call the collective beliefs, values, and practices shared across an organization?',
    answer: 'Company Culture',
    notes: 'Bonus Question for Host',
  },
  {
    id: 'bonus-5',
    round: 0,
    number: 5,
    question: 'What is the continuous commitment to learning new skills and professional development?',
    answer: 'Growth Mindset',
    notes: 'Bonus Question for Host',
  },
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Alex Rivera', department: 'Sales & Client Relations' },
  { id: 'emp-2', name: 'Jordan Cruz', department: 'Human Resources' },
  { id: 'emp-3', name: 'Samantha Lee', department: 'Operations' },
  { id: 'emp-4', name: 'Marcus Vance', department: 'IT Support' },
  { id: 'emp-5', name: 'Chloe Davies', department: 'Marketing' },
  { id: 'emp-6', name: 'David Kim', department: 'Finance & Accounting' },
  { id: 'emp-7', name: 'Priya Sharma', department: 'Product Quality' },
  { id: 'emp-8', name: 'Ethan Garcia', department: 'Logistics' },
  { id: 'emp-9', name: 'Mia Chen', department: 'Customer Success' },
  { id: 'emp-10', name: 'Lucas Scott', department: 'Project Management' },
  { id: 'emp-11', name: 'Zoe Anderson', department: 'Creative Design' },
  { id: 'emp-12', name: 'Nathan Wright', department: 'Engineering' },
  { id: 'emp-13', name: 'Hannah Taylor', department: 'Talent Acquisition' },
  { id: 'emp-14', name: 'Gabriel Santos', department: 'Business Analytics' },
  { id: 'emp-15', name: 'Olivia Martinez', department: 'Legal & Compliance' },
  { id: 'emp-16', name: 'Ryan Patel', department: 'Office Admin' },
];

export const DEFAULT_PRIZES = {
  round1: '🎉 Round 1 Qualifier Swag & Office Treat',
  round2: '☕ Round 2 Semi-Finalist Coffee Gift Card',
  round3: '🎁 Round 3 Finalist Premium Gift Pack',
  round4: '🏆 Grand Office Trivia Champion Trophy & Grand Prize!',
};
