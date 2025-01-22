// types.ts

export interface GoalstoryAboutInput {}

export interface GoalstoryReadSelfUserInput {}

export interface GoalstoryUpdateSelfUserInput {
  name?: string;
  about?: string;
  visibility?: number; // 0=public, 1=private
}

export interface GoalstoryCountGoalsInput {}

export interface GoalstoryCreateGoalInput {
  name: string;
  description: string;
  story: string;
  story_mode: string;
  belief_mode: string;
  notes?: string;
  evidence?: string;
}

export interface GoalstoryUpdateGoalInput {
  id: string; // Required
  name?: string;
  status?: number; // 0=Pending, 1=Complete
  description?: string;
  story?: string;
  notes?: string;
  outcome?: string;
  evidence?: string;
  story_mode?: string;
  belief_mode?: string;
}

export interface GoalstoryDestroyGoalInput {
  id: string;
}

export interface GoalstoryReadOneGoalInput {
  id: string;
}

export interface GoalstoryReadGoalsInput {
  page?: number;
  limit?: number;
}

export interface GoalstoryMarkGoalCompleteInput {
  id: string;
  name?: string;
  status?: number;
  description?: string;
  story?: string;
  notes?: string;
  outcome?: string;
  evidence?: string;
  story_mode?: string;
  belief_mode?: string;
}

export interface GoalstorySearchGoalSpaceInput {
  query: string;
}
