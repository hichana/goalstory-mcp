// goalstory-mcp types.ts

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

//
// CURRENT / CONTEXT
//
export interface GoalstoryReadCurrentFocusInput {}

export interface GoalstoryGetStoryContextInput {
  goalId: string;
  stepId: string;
  feedback?: string;
}

//
// STEPS
//
export interface GoalstoryCreateStepsInput {
  goal_id: string;
  steps: string[];
}

export interface GoalstoryReadStepsInput {
  goal_id: string;
  page?: number;
  limit?: number;
}

export interface GoalstoryReadOneStepInput {
  id: string;
}

export interface GoalstoryUpdateStepInput {
  id: string;
  name?: string;
  status?: number; // 0=Pending, 1=Complete
  outcome?: string;
  evidence?: string;
  notes?: string;
}

export interface GoalstoryDestroyStepInput {
  id: string;
}

//
// STORIES
//
export interface GoalstoryCreateStoryInput {
  goal_id: string;
  step_id: string;
  title?: string;
  story_text: string;
}

export interface GoalstoryReadStoriesInput {
  goal_id: string;
  step_id: string;
  page?: number;
  limit?: number;
}

export interface GoalstoryReadOneStoryInput {
  id: string;
}
