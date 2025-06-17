export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'High' | 'Moderate' | 'Low';
  dueDate?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
} 