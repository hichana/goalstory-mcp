// -----------------------------------------
// PROMPTS DATA
// -----------------------------------------
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

export const PROMPTS = {
  CLARIFY: `CLARIFY: Clarify the user's goal as their thought partner.`,
  FORMULATE: `FORMULATE: Formulate actionable steps for the user to achieve their stated goal.`,
  CONTEXT: `CONTEXT: Gather context about the user and their current goal/step pair.`,
  DISCUSS: `DISCUSS: Thoughtfully discuss a goal/step pair.`,
  CAPTURE: "CAPTURE: Capture/update notes for the current specific goal/step.",
  VISUALIZE: `VISUALIZE: Use context to create a highly personalized, belief system driven, and intrinsic motivations-aware story about the achieving of the goal/step pair.`,
  MANAGE: `MANAGE: Mark a goal and/or step complete, change status, schedule story generation, etc.
   Always first seek the user's confirmation before marking a goal and/or step complete, changing its status, scheduling stories, etc.`, // Updated MANAGE prompt description
};

export const CLARIFY_MESSAGES: PromptMessage[] = [
  {
    role: "user",
    content: {
      type: "text",
      text: `I have a goal that I'd like to achieve.         
           Work with me as my thought partner to clarify my goal so that it is clear, contextual and complete.
           Clarifying my goal with you is the 'CLARIFY' step from the Goal Story workflow.

           For your reference, here are some examples of vague goals and their clear, contextual and specific versions:

           <goal_story_example1>
           Vague Goal   
           "I just want to get in shape."   

           Clear, Contextual, and Complete Goal   
           Title: Run a 5K and Improve Fitness   
           Description: "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will achieve this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."
           </goal_story_example1>

           <goal_story_example2>
           Vague Goal   
           "I want a better job situation."   

           Clear, Contextual, and Complete Goal   
           Title: Transition to Project Management   
           Description: "I want to transition into a project management role at a mid-sized tech company within the next six months. To achieve this, I will complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."
           </goal_story_example2>

           <goal_story_example3>
           Vague Goal   
           "I need to save more money."   

           Clear, Contextual, and Complete Goal   
           Title: Build an Emergency Fund   
           Description: "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."
           </goal_story_example3>

           <goal_story_example4>
           Vague Goal   
           "I want to learn to speak Spanish."   

           Clear, Contextual, and Complete Goal   
           Title: Learn Conversational Spanish   
           Description: "Over the next six months, I want to reach an intermediate conversational level in Spanish to communicate comfortably when I travel to Spain in July. I will follow an online course for structured lessons, practice with a language exchange partner once a week, and read at least one Spanish article per day."
           </goal_story_example4>

           <goal_story_example5>
           Vague Goal   
           "I need a better work-life balance."   

           Clear, Contextual, and Complete Goal   
           Title: Achieve Better Work-Life Balance   
           Description: "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter to spend more time with my family and pursue personal hobbies. I'll accomplish this by delegating one major task to a team member, scheduling regular check-ins with my manager, and avoiding work emails after 7 PM."
           </goal_story_example5>`,
    },
  },
  {
    role: "assistant",
    content: {
      type: "text",
      text: `As the Goal Story assistant, I'm happy to help you clarify your goal so it's focused and achievable.         
           After we have fully clarified your goal, I will ask you if you would like me to save it to Goal Story for you.`,
    },
  },
  {
    role: "user",
    content: {
      type: "text",
      text: `Great. Now let's begin our thought partnership to clarify my goal.`,
    },
  },
];

export const FOMRULATE_MESSAGES: PromptMessage[] = [
  {
    role: "user",
    content: {
      type: "text",
      text: `I would like to formulate steps for achieving my goal.
             Work with me as my thought partner to formulate an actionable list of steps.
             Formulating the list of steps here is the 'FORMULATE' step from the Goal Story workflow.

             For your reference, here are some examples of actionable steps generated for a given goal in Gaol Story:

             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Actionable Steps:
             1. Schedule Workouts:
               Notes:
               • Block out three specific days each week for running (e.g., Monday, Wednesday, Friday).
               • Block out two specific days for strength training (e.g., Tuesday, Thursday).
             2. Create a Running Progression Plan:
               Notes:
               • Week 1-2: Alternate 1-minute jogging with 1-minute walking for 20 minutes.
               • Week 3-4: Jog for 2 minutes, walk for 1 minute, repeat for 25 minutes.
               • Week 5-6: Increase continuous running segments until you can run 15 minutes non-stop.
               • Week 7-8: Gradually increase running time to 25-30 minutes without walking breaks.
             3. Structure Strength Training:
               Notes:
               • Focus on compound exercises (squats, lunges, push-ups, planks) to build overall strength.
               • Perform 2-3 sets of 8-12 reps per exercise, increasing resistance or difficulty over time.
             4. Track Progress:
               Notes:
               • Use a fitness app to log runs (distance, time, pace) and strength workouts (weights, sets, reps).
               • Take body measurements or photos every 2-3 weeks to monitor body composition changes.
             5. Adopt Healthy Eating Habits:
               Notes:
               • Aim for balanced meals with lean protein, complex carbs, and plenty of vegetables.
               • Limit sugary snacks and drinks to help reduce body fat percentage.
             6. Regularly Check and Adjust:
               Notes:
               • Every two weeks, evaluate progress (running distance, body composition).
               • If you are re not improving as expected, consider adjusting calorie intake or training intensity.
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Actionable Steps:
             1. Choose and Enroll in a Project Management Course:
               Notes:
               • Research reputable online certification programs (e.g., PMP, CAPM, or other courses).
               • Set a completion deadline within 3-4 months so you can add it to your résumé.
             2. Develop Project Management Skills on the Job (If Possible):
               Notes:
               • Volunteer to take on small coordination or leadership tasks in your current role.
               • Practice creating project plans, timelines, and status reports for these tasks.
             3. Update Your Résumé and LinkedIn Profile:
               Notes:
               • Highlight relevant experiences, such as any cross-functional projects or leadership roles.
               • Add any completed or in-progress certifications or courses.
               • Use clear, quantifiable achievements (e.g., "Led a team of 5 to complete a software pilot project under budget by 10%").
             4. Attend Networking Events:
               Notes:
               • Identify industry meetups, conferences, or local PMI (Project Management Institute) chapter events.
               • Aim for at least two events per month; come prepared with business cards and a concise intro pitch.
               • Follow up with new contacts via LinkedIn or email within 48 hours of meeting them.
             5. Set Up Informational Interviews:
               Notes:
               • Reach out to current project managers in your network or via LinkedIn.
               • Ask questions about the role, the industry, and best practices for transitioning.
               • Seek referrals if a suitable position is open at their company.
             6. Apply for Relevant Openings and Follow Up:
               Notes:
               • Identify and apply for project coordinator or junior PM roles at mid-sized tech companies.
               • Tailor each application to the job description.
               • Send polite follow-up emails if you have not heard back within 1-2 weeks.
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Actionable Steps:
             1. Open a Dedicated Savings Account (if needed):
               Notes:
               • Look for a high-yield savings account with a favorable interest rate and no monthly fees.
             2. Automate Transfers:
               Notes:
               • Schedule an automatic 10% transfer from each paycheck to your savings account.
               • If you are paid bi-weekly, confirm the date and set the recurring transfer to occur immediately after payday.
             3. Create a Budget:
               Notes:
               • List all monthly expenses (rent, utilities, groceries, etc.).
               • Track variable expenses (entertainment, dining out) for at least one month to find areas to cut back.
               • Aim to adjust spending so you can comfortably save the desired 10% without financial strain.
             4. Use a Budgeting App:
               Notes:
               • Input all transactions and categorize them (e.g., bills, groceries, entertainment).
               • Review your spending vs. saving progress weekly or monthly.
             5. Build an Emergency Buffer:
               Notes:
               • Prioritize paying off high-interest debt (if any) to reduce financial strain.
               • If unexpected costs arise, use the budgeting app to identify areas to temporarily reduce spending.
             6. Track Progress Toward the $5,000 Goal:
               Notes:
               • Check your savings balance monthly.
               • If you are falling behind, consider increasing the transfer percentage temporarily or cutting an additional expense.
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Actionable Steps:
             1. Choose a Structured Learning Program:
               Notes:
               • Pick an online course or app (e.g., Duolingo, Babbel, Rosetta Stone, or a local community course).
               • Schedule 30-60 minutes daily to complete lessons.
             2. Set a Weekly Practice Routine:
               Notes:
               • Book a consistent time with a language exchange partner or tutor (e.g., one hour every Tuesday).
               • Focus on conversation skills: learn new vocabulary, practice grammar in real-life contexts, and get feedback on pronunciation.
             3. Daily Reading Goal:
               Notes:
               • Select short articles from Spanish news sites or blogs (e.g., El País, BBC Mundo).
               • Look up unfamiliar words, and create flashcards or a vocabulary list.
             4. Supplement with Listening Practice:
               Notes:
               • Listen to Spanish podcasts or watch short YouTube videos in Spanish for at least 10-15 minutes a day.
               • Aim to pick content that aligns with your interests to stay engaged.
             5. Track Vocabulary and Progress:
               Notes:
               • Keep a notebook or digital document with newly learned words and phrases.
               • Review your vocabulary list 2-3 times a week.
             6. Assess Conversational Ability Monthly:
               Notes:
               • At the end of each month, record yourself speaking for 2-3 minutes on a topic you care about.
               • Listen back, note mistakes or gaps, and bring them up in your next practice session.
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Actionable Steps:
             1. Assess Current Workload and Priorities:
               Notes:
               • Make a list of all your current responsibilities.
               • Identify tasks that can be delegated, streamlined, or postponed.
             2. Delegate Appropriately:
               Notes:
               • Select at least one major task or project that a team member can handle.
               • Provide clear instructions, deadlines, and support so they can confidently take it on.
             3. Schedule Regular Manager Check-Ins:
               Notes:
               • Set a weekly or bi-weekly meeting with your manager to review workload.
               • Communicate your goal of reducing weekly hours and discuss potential roadblocks.
             4. Create a Structured Work Schedule:
               Notes:
               • Outline daily start and end times—e.g., 8:00 AM to 5:00 PM, with a hard stop at 5:00 PM.
               • Block off lunch breaks and short breaks to maintain productivity and avoid burnout.
             5. Establish Clear Boundaries:
               Notes:
               • Set an out-of-office reply on your email after 7 PM.
               • If necessary, update your team calendar to show you are unavailable after a certain time.
             6. Monitor Hours and Adjust as Needed:
               Notes:
               • Use time-tracking software or a simple spreadsheet to log work hours.
               • If you notice you are creeping above 40 hours, identify tasks that can be delayed or delegated further.
             7. Plan Family and Personal Time:
               Notes:
               • Schedule weekly family activities or personal hobbies so they become non-negotiable events.
               • Reflect weekly on whether your balance is improving and adjust strategies as needed.
             </goal_story_example5>`,
    },
  },
  {
    role: "assistant",
    content: {
      type: "text",
      text: `As the Goal Story assistant, I'm happy to help you formulate actionable steps for your goal.           
             After I have worked with you to create the actionable steps, I will ask you if you would like me to save them to Goal Story for you.`,
    },
  },
  {
    role: "user",
    content: {
      type: "text",
      text: `Great. Now let's begin our thought partnership to formulate the steps.`,
    },
  },
];

export const CONTEXT_MESSAGES: PromptMessage[] = [
  {
    role: "user",
    content: {
      type: "text",
      text: `I would you to gather context about me and my current goal/step as part of the 'CONTEXT' step from the Goal Story workflow.

             For your reference, here are some examples of context gathered about other users of Goal Story:

             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Gathered context:
             Mia is a 29-year-old software developer who used to run cross-country in high school but hasn't consistently exercised in the past few years. She feels low on energy and wants to regain her endurance and improve her body composition. Mia has a demanding job with frequent deadlines, and she worries about balancing her workout schedule with her work responsibilities. She's very motivated by personal growth and tracking visible progress, and she tends to do well with structured plans that fit into her packed schedule.
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Gathered context:
             Michael is a 34-year-old IT professional who has taken on informal leadership roles in his current position. He enjoys mentoring junior staff and organizing small projects but lacks an official title or certification in project management. He feels ready for a more defined leadership position at a mid-sized tech company and has some savings to invest in professional courses. Michael is driven by the desire to learn new skills and achieve career advancement; he's also hoping a higher salary will provide more financial stability for his family.
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Gathered context:
             Carla is a 26-year-old marketing associate living in a major city, facing high rent and cost of living. She frequently finds herself running out of money before each paycheck despite earning a competitive salary. She wants to build an emergency fund of $5,000 over the next year to gain financial peace of mind. Carla has tried budgeting apps in the past but found them tedious. She's motivated by a sense of security and wants clear, automated systems that make saving feel effortless.
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Gathered context:
             Amaan is a 23-year-old recent college graduate planning a trip to Spain in six months. He's always been fascinated by Spanish culture, food, and music but only has a basic vocabulary. He aims to achieve an intermediate conversational level to feel confident during travel. Amaan is very social and learns best through interactive, real-world practice. He's also eager to use Spanish for potential job opportunities in international business.
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Gathered context:
             Robin is a 42-year-old mid-level manager who often works 50 hours a week. They have two children in elementary school and feel guilty about missing family dinners and weekend outings. Robin has tried to reduce working hours before but struggled to delegate tasks. They're driven by a desire to be more present for family while still meeting workplace expectations. Robin responds well to routine and would benefit from a clear plan to reclaim personal time without compromising job performance.
             </goal_story_example5>                        
             `,
    },
  },
  {
    role: "assistant",
    content: {
      type: "text",
      text: `As the Goal Story assistant, I'm happy to gather context about you and your current goal/step pair.`,
    },
  },
  {
    role: "user",
    content: {
      type: "text",
      text: `Great. Now let's begin. What else do you not yet know that you would like to know aboutme or my current goal and/or step?`,
    },
  },
];

export const DISCUSS_MESSAGES: PromptMessage[] = [
  {
    role: "user",
    content: {
      type: "text",
      text: `I would like to my goal/step in detail.         
             Work with me as my thought partner to carefully discuss my goal and step in detail so that I am more likely to uncover insights with you.
             Discussing my goal and/or step here with you is the 'DISCUSS' step from the Goal Story workflow.

             For your reference, here are some examples of an assistant's initial response to start the discussion:

             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Current step:
             Schedule Workouts

             Discussion outline:
             "Let's talk about how you can successfully schedule your workouts. First, what does your typical weekly routine look like? Do you have any set commitments—like work, family responsibilities, or social events—that we need to consider?

             Think about the times of day when you have the most energy. For some people, morning workouts feel refreshing because they get it done before the day's distractions set in. Others perform better in the afternoon or evening. My job here is to help you find a schedule that's realistic and aligns with your natural energy levels.

             Once we pinpoint the best days and times, let's actually lock them into your calendar—treat these workout sessions like important appointments. That way, you'll be less likely to skip them. How does that sound? Any concerns or obstacles you see that might interfere with this plan? Let's brainstorm strategies for managing or avoiding those obstacles, whether it's coordinating with family members, setting reminders, or even finding a workout buddy who will keep you accountable."
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Current step:
             Choose and Enroll in a Project Management Course

             Discussion outline:
             "You mentioned you want to move into project management, which is great. Let's talk about selecting a reputable course that fits your goals and lifestyle. Are you aiming for a specific certification like PMP or CAPM, or are you interested in a more general project management overview first?

             It's important to find a course that aligns with your current level of experience and the industry you want to be in. For instance, if you're looking at tech, maybe a course that includes agile methodologies is a good fit. Also, consider your time constraints—do you have the bandwidth to tackle a two-month intensive program, or do you need a more flexible, self-paced option?

             Once you've chosen a course, committing to it is key. How will you set aside dedicated study time each week? Will you need to talk to your manager about adjusting your schedule, or could you plan to study on weekends? Let's make sure we map out that time before you enroll. That way, you'll set yourself up for success right from the start."
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Current step:
             Open a Dedicated Savings Account (if needed)

             Discussion outline:
             "So, you want to build up your emergency fund by saving consistently. Opening a high-yield savings account is a solid first move. Let's discuss what you need to look for.

             One important consideration is the interest rate, of course, but also think about fees or minimum balances that could affect your savings. Some banks offer great introductory rates that drop after a certain period, so I'd encourage you to look at the long-term benefits.

             Besides the financial details, there's a psychological aspect: When your savings account is separate from your regular checking, you're less tempted to dip into those funds. How do you feel about automating deposits into that new account? Automating is often a key to ensuring you save before you have a chance to spend. Is there anything that might prevent you from setting up an automatic transfer? Let's talk through any concerns so you can confidently take this step."
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Current step:
             Choose a Structured Learning Program

             Discussion outline:
             "You want to get to an intermediate conversational level in Spanish within six months. That's exciting—and definitely doable with the right approach. The first step is to pick a structured learning program. Let's think about what sort of format works best for you. Do you enjoy interactive apps, or do you learn better with a more traditional online course that includes assignments and progress tests?

             Also, consider how you like to learn—are you self-driven enough to keep up with a purely self-paced course, or do you benefit from a bit more external accountability, like a live class or a tutor who checks in regularly?

             Once you decide on the right program, I recommend setting specific times each day to study, even if it's just 30 minutes. Consistency really pays off when learning a new language. How can we build those study sessions into your daily routine? Let's explore what mornings, lunch breaks, or evenings look like for you right now."
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Current step:
             Assess Current Workload and Priorities

             Discussion outline:
             "You want to reduce your work hours from 50 to 40 per week. Before we do anything else, it's essential to get a clear picture of where your time is actually going. Let's start by listing out every recurring task, project, or responsibility you handle. We can review how much time each takes and which ones are absolutely critical.

             Sometimes, we discover we're spending hours on tasks that could be automated, delegated, or done more efficiently. Other times, we find tasks that aren't as high-priority as we assumed. Is there a time-tracking tool you might be comfortable with for a week or two, so we can see exact data on your work patterns?

             Once we have that info, we can talk about streamlining processes or reassigning tasks. But first, let's get an honest snapshot of your workload—without that, we can't make meaningful changes. Does anything about this step feel overwhelming or unclear? Let's break it down so it's manageable."
             </goal_story_example5>`,
    },
  },
  {
    role: "assistant",
    content: {
      type: "text",
      text: `As the Goal Story assistant, I'm happy to discuss your goal/step.         
             As we discuss your goal/step in detail, I will ask you along the way if you'd like me to save any notes with insights from our discussion or ideas you want to capture to the goal's notes in Goal Story.`,
    },
  },
  {
    role: "user",
    content: {
      type: "text",
      text: `Great. Now let's begin our discussion.`,
    },
  },
];

export const CAPTURE_MESSAGES: PromptMessage[] = [
  {
    role: "user",
    content: {
      type: "text",
      text: `I would like to capture some notes about my current goal/step.         
             All notes must markdown format.
             Capturing notes for me is the 'CAPTURE' step from the Goal Story workflow.`,
    },
  },
  {
    role: "assistant",
    content: {
      type: "text",
      text: `As the Goal Story assistant, I'm happy to capture notes related to your goal/step.         
             I will always format notes as markdown.`,
    },
  },
  {
    role: "user",
    content: {
      type: "text",
      text: `Great. Now how should we begin capturing my notes?`,
    },
  },
];

export const VISUALIZE_MESSAGES: PromptMessage[] = [
  {
    role: "user",
    content: {
      type: "text",
      text: `I would like you to use all the context you know about me, my beliefs and my intrinsic motivators and generate a story about me achieving my goal step.
             Helping me visualize my goal step by creating a story for me is the 'VISUALIZE' step from the Goal Story workflow.
                   
             If you don't know enough about me to create a story, you can use the 'goalstory_read_self_user' tool.
             If you don't know enough about me and my goal and step, you can both ask me for details and use the 'goalstory_get_story_context' tool.

             For your reference, here are some examples of generated stories:
              
             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Current step:
             Schedule Workouts

             Story:
             Mia feels the gentle buzz of her morning alarm at 6:30 AM. Instead of hitting snooze like she used to, she sits up with a quiet excitement. Her smartphone screen already displays the day's schedule—blocking off time at 7 PM for her first running session of the week. As she scrolls through her work calendar, she notices how neatly the workout fits between her project deadlines and a short call with a coworker. Images of her high school cross-country days flood back, reminding her how she used to feel the crisp air rushing past her and the sense of freedom in her stride. By pressing "confirm" on her calendar, Mia makes a tangible promise to herself: to reclaim that feeling of strength and stamina. She pictures herself leaving the office, changing into her new running shoes, and stepping onto the sidewalk to start that first scheduled run. This single moment of scheduling is a confident signal—she has made time in her busy life for her own health. The day ends with a satisfied smile, knowing she has put her plan into action.
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Current step:
             Choose and Enroll in a Project Management Course

             Story:
             Michael sits at his desk in the early evening, laptop open, a steaming cup of coffee by his side. A spreadsheet of potential courses is displayed before him, each row a fresh possibility. He imagines, six months from now, walking into a new mid-sized tech company's office with an official project management certification under his belt. In that vision, he's collaborating with a small, high-energy team, confidently referencing Agile methodologies and guiding them toward project milestones. As he hovers his cursor over the "Enroll Now" button for a top-rated, 10-week online course, he envisions proud updates to his résumé and LinkedIn profile. He sees the moment his manager shakes his hand, congratulating him on completing the course—recognition of his growing expertise. Clicking the button feels symbolic of the bigger shift he's making: from someone who coordinates informally to a bona fide project manager equipped with the right credentials. The gentle ping of the confirmation email echoes his excitement. He has taken the first leap toward his next career chapter.
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Current step:
             Open a Dedicated Savings Account (if needed)

             Story:
             Late on a Saturday afternoon, Carla curls up on her couch with her laptop. The sun is warm on her back, and she feels a calm sense of determination. She navigates to an online banking site she's heard good things about—no monthly fees, a high interest rate, and intuitive digital tools. As she fills out the application form, she pictures what this new savings account represents: a safety cushion that protects her from unexpected expenses and a stepping stone toward one day owning her own home. She imagines the balance growing steadily, dollar by dollar, and sees herself a year from now, smiling at a $5,000 balance, free of the stress of living paycheck to paycheck. Clicking the final "Open Account" button, she feels a small thrill of accomplishment. In her mind's eye, she's already transferring that first automatic 10%, hearing the gentle "cha-ching" that signals a better future. She closes her laptop with a contented sigh, proud that she's taken the first real step toward financial security.
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Current step:
             Choose a Structured Learning Program

             Story:
             Amaan pictures himself stepping off a plane in Madrid, six months from now, bag slung over his shoulder, confidently greeting the airport staff in Spanish. He imagines ordering tapas in a busy restaurant, chatting with the waiter about local music spots, and laughing at jokes delivered in a language that used to feel so foreign. Now, as he scrolls through an online course catalog, he's looking for a program that uses real conversation practice, one that meshes with his social nature. He clicks on a course promising weekly live sessions with native speakers and sees himself logging on from his laptop, excited to practice new phrases. The first day, he envisions introducing himself in Spanish to a friendly tutor and feeling the spark of motivation that comes from being understood. By choosing this course, Amaan commits to the journey of daily lessons and interactive sessions—his key to making that vision of Spanish immersion a reality. He completes the enrollment form, smiling as he hits "submit," envisioning the day he'll step onto Spanish soil ready to speak, connect, and explore.
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Current step:
             Assess Current Workload and Priorities

             Story:
             Robin stands in their office, an empty whiteboard in front of them. The word "PRIORITIES" is written across the top in bold letters. They close their eyes and imagine a calmer workweek—a 40-hour schedule that leaves space for Wednesday night dinners with family and weekend hikes with the kids. In that vision, Robin is leading team meetings with confidence, knowing which tasks to delegate and which to handle personally. No more late-night inbox scanning or a constant feeling of guilt. Opening their eyes, Robin methodically lists every single project, team request, and committee commitment on the board. It's a surprising amount, but with each new item, Robin sees a path toward clarity forming. They feel relief imagining how some tasks can be handed off or postponed. The mental image of finishing work at 5 PM on Friday, smiling as they leave the office to pick up the kids, motivates Robin to keep writing until every task is accounted for. Stepping back to review the board, they sense the beginnings of balance. This honest snapshot of their workload is the key to building a healthier, more harmonious life.
             </goal_story_example5>
             `,
    },
  },
  {
    role: "assistant",
    content: {
      type: "text",
      text: `As the Goal Story assistant, I'm happy to generate a personalized story about you achieving your goal step.         
             After I have created your story, I will present it to you and ask you if you would like me to save it to Goal Story for you.`,
    },
  },
  {
    role: "user",
    content: {
      type: "text",
      text: `Thank you, can you now go ahead and create the story, and write it all out for me here?
             After you've written it out can you check with me to see if I want to change it or save it to Goal Story?`,
    },
  },
];

export const MANAGE_MESSAGES: PromptMessage[] = [
  {
    role: "user",
    content: {
      type: "text",
      // Updated text to include scheduling
      text: `I would like your help managing my goals, steps, or scheduled stories in Goal Story. This could involve marking things complete, changing status, deleting items, or scheduling/unscheduling automatic story generation. Can you help me with the 'MANAGE' step from the Goal Story workflow?`,
    },
  },
  {
    role: "assistant",
    content: {
      type: "text",
      // Updated assistant response
      text: `As the Goal Story assistant, I'm happy to help you manage your goals, steps, and scheduled stories. What would you like to do? Just let me know, and I'll confirm with you before making any changes.`,
    },
  },
];
