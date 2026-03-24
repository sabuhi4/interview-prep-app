INSERT INTO questions (id, category, difficulty, question, answer, tags, admin_only)
VALUES
  (
    'behavioral-significant-challenge-001',
    'Behavioral',
    'hard',
    'Can you describe a time when you faced a significant challenge on a project and how you handled it?',
    'Answer 1: In a previous role, we had a critical challenge: we needed to run a pilot test in 20 retail points of sale under a tight deadline. The biggest risk was deploying new hardware and training staff in a short window. I took ownership by coordinating with field technicians to rush equipment deliveries and provide remote setup. I also led brief remote training sessions and created quick video tutorials. After launch, we implemented real-time monitoring, which let us quickly detect usability issues. As a result, we improved the system and achieved 90% readiness for full production. This taught me the importance of decisive risk management and rapid field support.

Answer 2: In a previous role at DigitalVertex, we faced a major challenge when we needed to deploy a pilot program in 20 sales locations on a tight timeline. The risk was balancing hardware logistics and training within days. I took charge by aligning with field teams to expedite equipment delivery and used remote tools to set up and train staff quickly. After launch, I monitored usage in real time, catching issues early, and we achieved 90% readiness for full-scale production.',
    ARRAY['project-management', 'problem-solving', 'leadership'],
    true
  ),
  (
    'behavioral-team-conflict-001',
    'Behavioral',
    'medium',
    'Can you describe a time when you faced a conflict within your team and how you resolved it?',
    'Answer 1: In a previous role, I introduced a new shift plan, but this led to conflict due to overlapping team needs. I addressed it by meeting with each team member individually to understand their concerns. After active listening, I refined the schedule, ensuring it balanced everyone''s priorities. I then used an anonymous survey to confirm acceptance. In the end, the team was aligned, and we improved both morale and productivity.

Answer 2: In a previous role at Caspiantech, when I announced a new shift plan for our team, I quickly realized there was a conflict due to overlapping responsibilities. Given my experience leading cross-functional teams, I met individually with each member to identify their key concerns. Using that input, I redesigned the schedule, balancing everyone''s needs. Afterward, I conducted an anonymous survey to validate the solution. This process, combined with my agile approach, ensured the team was aligned, which improved our workflow and kept us on track.

Answer 3: In one of my roles at DigitalVertex, I introduced a new workflow that inadvertently created overlap in responsibilities across the team. Drawing from my product ownership and agile background, I brought the team together for a series of focused, one-on-one conversations to understand their friction points. After that, I adjusted the plan, redistributed tasks, and created a transparent tracking system. Once we implemented it, team morale improved, and we met our sprint goals without further issues.',
    ARRAY['teamwork', 'conflict-resolution', 'communication'],
    true
  ),
  (
    'behavioral-adapt-to-change-001',
    'Behavioral',
    'medium',
    'Can you give me an example of a time when you had to adapt to a significant change in a project, and how you handled it?',
    'In my role at Caspiantech, we were mid-platform update when a regulatory change forced a complete redesign of the user flow. I quickly realigned the team by breaking down the new requirements and reprioritizing our backlog. Using my product management experience, I ensured compliance steps were integrated smoothly. We adjusted the timeline and delivered a fully compliant product on schedule.',
    ARRAY['adaptability', 'agile', 'change-management'],
    true
  ),
  (
    'behavioral-difficult-stakeholder-001',
    'Behavioral',
    'medium',
    'Can you tell me about a time when you had to work with a difficult stakeholder, and how you managed to build a productive relationship?',
    'At Caspiantech, I worked with a key sales stakeholder who was initially resistant to our new product features. I set up regular one-on-one meetings to understand their concerns and kept them closely informed of our progress. By showing how the changes aligned with their goals—like improving customer engagement—they gradually became a champion of the project. As a result, we improved alignment, and their support helped drive adoption across the organization.',
    ARRAY['stakeholder-management', 'communication', 'relationship-building'],
    true
  ),
  (
    'behavioral-balance-priorities-001',
    'Behavioral',
    'medium',
    'Can you share a situation where you had to balance multiple priorities, and how you ensured nothing fell behind?',
    'At DigitalVertex, I often managed simultaneous development streams—frontend features, backend APIs, and compliance updates. I ensured nothing fell behind by using a clear prioritization framework. I broke down each task, set sprint goals, and used daily standups to track progress. When priorities shifted, I quickly reassessed the timeline, communicated risks, and reallocated resources. This approach ensured we consistently met key deadlines without losing quality.',
    ARRAY['prioritization', 'time-management', 'project-management'],
    true
  ),
  (
    'behavioral-led-project-001',
    'Behavioral',
    'hard',
    'Can you describe a time when you led a project from start to finish, and what the outcome was?',
    'At Caspiantech, I took the lead on a critical platform modernization project. While working closely with the development team, I defined the scope, set milestones, and ensured alignment between business objectives and technical delivery. I facilitated communication between stakeholders and the team, and we successfully launched the updated platform on time. The outcome was a smoother user experience, reduced error rates, and a significant uptick in customer engagement.',
    ARRAY['leadership', 'project-management', 'delivery'],
    true
  ),
  (
    'behavioral-learn-new-tech-001',
    'Behavioral',
    'medium',
    'Can you tell me about a time when you had to learn a new technology or tool quickly to deliver on a project, and how you managed that?',
    'At DigitalVertex, we needed to add AI-driven features to our platform, so I had to learn LangChain and a new AI API on a tight timeline. I immersed myself in documentation, built small prototypes each evening, and applied the concepts to a real feature by the next sprint. As a result, we delivered a working AI assistant ahead of schedule, which boosted user engagement by 25%.',
    ARRAY['learning', 'adaptability', 'technical-skills'],
    true
  ),
  (
    'behavioral-tight-deadline-001',
    'Behavioral',
    'medium',
    'Can you describe a time when you had to manage a project with a tight deadline, and how you ensured it was met?',
    'At Caspiantech, we had a critical feature launch with just three weeks. I prioritized tasks, broke them into daily goals, and kept constant communication with the team. By focusing on the must-haves and removing blockers early, we delivered the feature on time, and it drove a 15% increase in user retention.',
    ARRAY['time-management', 'project-management', 'pressure'],
    true
  ),
  (
    'behavioral-improved-process-001',
    'Behavioral',
    'easy',
    'Tell me about a time when you improved a process within your team.',
    'At DigitalVertex, I noticed our code review cycle was slowing us down. I introduced a structured review template and a daily standup focused on blockers. As a result, we reduced review time by 30%, accelerating deployment and improving code quality.',
    ARRAY['process-improvement', 'efficiency', 'leadership'],
    true
  ),
  (
    'behavioral-communication-style-001',
    'Behavioral',
    'easy',
    'Can you give an example of a time when you had to adapt your communication style for a diverse audience?',
    'While at Caspiantech, I often presented progress to both technical teams and business stakeholders. I adjusted my language by using more technical detail for engineers and more business impact examples for leadership. This ensured everyone stayed aligned, and we avoided misunderstandings.',
    ARRAY['communication', 'adaptability', 'stakeholder-management'],
    true
  )
ON CONFLICT (id) DO NOTHING;
