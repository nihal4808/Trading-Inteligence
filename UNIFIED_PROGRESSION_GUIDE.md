# Unified Progression System - Integration Guide

## Overview

The system has been upgraded to a unified progression workflow where:
- **Roadmap** is the primary source of truth
- **Weekly Planner** syncs with roadmap sections
- **Daily Tasks** can link to roadmap tasks
- **Reviews & Reflections** track learning outcomes
- **Progress** and **Analytics** reflect the complete workflow

## Architecture

```
Roadmap (PRIMARY SOURCE)
    ↓
RoadmapTask (with completion + status tracking)
    ├→ RoadmapReview (learning outcomes, mood, confidence)
    ├→ DailyTask (optional linking)
    └→ WeeklyPlan (linked to RoadmapSection)
        ↓
    Progress Calculation
        ↓
    Analytics & Dashboard
```

## Database Changes

### Enhanced RoadmapTask Model
```prisma
model RoadmapTask {
  id                   String
  sectionId            String
  title                String
  description          String?
  category             String
  dayNumber            Int
  dayLabel             String?
  estimatedDuration    Int?
  recommendedResources String?
  completed            Boolean      @default(false)
  completedAt          DateTime?
  status               String       @default("not_started")  // not_started | in_progress | completed | reviewed
  progressPercentage   Int          @default(0)
  notes                String?
  order                Int
  
  section              RoadmapSection
  reviews              RoadmapReview[]
  dailyTasks           DailyTask[]
}
```

### New RoadmapReview Model
Tracks learning outcomes and personal reflections:
```prisma
model RoadmapReview {
  id                String
  roadmapTaskId     String
  review            String?  // What was learned
  reflection        String?  // Personal reflection
  mood              Int?     // 1-10
  confidenceLevel   Int?     // 1-10
  difficultyLevel   Int?     // 1-10
  lessonsLearned    String?
  createdAt         DateTime
  
  roadmapTask       RoadmapTask
}
```

### Updated DailyTask Model
Optional link to roadmap tasks for synchronization:
```prisma
model DailyTask {
  id            String
  roadmapTaskId String?  // Link to roadmap (optional)
  date          DateTime
  title         String
  description   String?
  category      String
  priority      String
  completed     Boolean
  completedAt   DateTime?
  notes         String?
  
  roadmapTask   RoadmapTask?
}
```

### Updated WeeklyPlan Model
Now linked to RoadmapSection for automatic synchronization:
```prisma
model WeeklyPlan {
  id                String
  roadmapSectionId  String? @unique  // Link to roadmap week
  weekStartDate     DateTime
  weekEndDate       DateTime
  focusTopic        String
  ...
  
  section           RoadmapSection?
}
```

## Services

### 1. Progression Service
**File:** `src/services/progression/progressionService.ts`

Core functions for unified progression management:

- `syncRoadmapTaskToWeekProgress(taskId)` - Updates weekly progress when a task completes
- `createDailyTasksFromRoadmapTasks(weekNumber)` - Generate daily tasks from roadmap
- `toggleRoadmapTaskWithStatus(taskId, completed, status)` - Complete task with status tracking
- `getCurrentWeekProgress()` - Get current week metrics
- `getProgressionStats()` - Get overall progression statistics

### 2. Review Service
**File:** `src/services/progression/reviewService.ts`

Review and reflection management:

- `createOrUpdateReview(taskId, input)` - Create or update a review
- `getReviewForTask(taskId)` - Get review for a single task
- `getReviewsForSection(sectionId)` - Get all reviews in a week
- `markTaskAsReviewed(taskId)` - Mark task status as 'reviewed'
- `getReviewStatistics()` - Overall review metrics
- `getWeekProgressWithReviews(weekNumber)` - Week progress including review stats

## API Endpoints

### Progression
- `GET /api/progression/stats` - Overall progression statistics

### Roadmap Task Enhancement
- `POST /api/roadmap/tasks/[taskId]/review` - Create/update review for a task
- `GET /api/roadmap/tasks/[taskId]/review` - Get review for a task
- `POST /api/roadmap/tasks/[taskId]/mark-reviewed` - Mark task as reviewed
- `PATCH /api/roadmap/tasks/[id]` - Toggle task completion (now supports status)

## UI Components

### New Components

1. **RoadmapTaskCard** (`src/modules/roadmap/RoadmapTaskCard.tsx`)
   - Enhanced task display with status badges
   - Complete/incomplete toggle
   - Progress bar
   - Review summary display
   - Action buttons (Add Review, Mark Reviewed)

2. **ReviewModal** (`src/modules/roadmap/ReviewModal.tsx`)
   - Multi-field review form
   - Mood, confidence, difficulty sliders (1-10)
   - Text fields for learning, reflection, lessons
   - Save/cancel actions

3. **RoadmapPageEnhanced** (`src/modules/roadmap/RoadmapPageEnhanced.tsx`)
   - Integrated review workflow
   - Review modal management
   - Task toggle with status support

### Updated Components

1. **WeekCard** - Updated to use RoadmapTaskCard and support review callbacks
2. **RoadmapTask UI Types** - Extended to include status, progressPercentage, notes

## Task Completion Workflow

### Step 1: Complete a Task
User clicks the checkbox on a roadmap task:
```
toggleRoadmapTaskWithStatus(taskId, true, "in_progress")
```

### Step 2: Complete Task Full
Once truly done:
```
toggleRoadmapTaskWithStatus(taskId, true, "completed")
```

### Step 3: Add Review
User clicks "Add Review" button:
```
POST /api/roadmap/tasks/[taskId]/review
{
  "review": "Learned about RSI indicators...",
  "reflection": "This was harder than expected...",
  "mood": 7,
  "confidenceLevel": 6,
  "difficultyLevel": 8,
  "lessonsLearned": "RSI helps identify overbought/oversold conditions"
}
```

### Step 4: Mark as Reviewed
After review is complete:
```
POST /api/roadmap/tasks/[taskId]/mark-reviewed
```
Task status changes to "reviewed"

## Status Types

- `not_started` - Task not yet started
- `in_progress` - Currently working on task
- `completed` - Task completed (but not yet reviewed)
- `reviewed` - Task completed AND reviewed

## Synchronization Rules

When a roadmap task is completed:
1. ✓ Weekly progress percentage updates
2. ✓ Overall roadmap progress updates
3. ✓ Any linked daily tasks update
4. ✓ Dashboard progress cards refresh
5. ✓ Analytics metrics recalculate

When a review is created:
1. ✓ Review data persists in database
2. ✓ Task mood/confidence/difficulty metrics update
3. ✓ Week-level review statistics recalculate
4. ✓ Analytics dashboard updates

## Backward Compatibility

- Weekly Planner and Daily Tasks can still be used independently
- Roadmap tasks don't require linking to weekly/daily tasks
- `roadmapSectionId` and `roadmapTaskId` foreign keys are nullable
- Existing weekly plans and daily tasks continue to work

## Data Flow Example

1. User imports roadmap (4 weeks)
2. Creates weekly plan for Week 1 (optional - still works independently)
3. Completes roadmap tasks from Day 1
4. Task completion → week progress updates
5. Adds review for completed task
6. Review submitted → task marked as "reviewed"
7. Dashboard shows: "Week 1: 3/7 tasks completed, 2 reviews pending"
8. Analytics track: mood trend, difficulty trend, confidence trend

## Next Steps

To fully integrate the system:
1. Run the database migration (✓ completed)
2. Deploy the new services and APIs (✓ completed)
3. Update Dashboard to show unified progression stats
4. Add Weekly Planner auto-generation from roadmap sections
5. Add Daily Task auto-generation from roadmap days
6. Create Weekly Review reports from roadmap reviews
7. Add progress visualizations and charts

## Testing the System

```bash
# Start dev server
npm run dev

# Navigate to /roadmap
# Complete some tasks
# Add reviews using the modal
# Check /api/progression/stats for overall metrics
# Check /api/roadmap for task status changes
```

## Files Modified

### Prisma
- `prisma/schema.prisma` - Added review model, updated relations
- `prisma/migrations/*add_unified_progression*` - Migration file

### Services
- `src/services/progression/progressionService.ts` - NEW
- `src/services/progression/reviewService.ts` - NEW

### APIs
- `src/app/api/progression/stats/route.ts` - NEW
- `src/app/api/roadmap/tasks/[taskId]/review/route.ts` - NEW
- `src/app/api/roadmap/tasks/[taskId]/mark-reviewed/route.ts` - NEW
- `src/app/api/roadmap/tasks/[id]/route.ts` - UPDATED

### UI Components
- `src/modules/roadmap/RoadmapTaskCard.tsx` - NEW (enhanced task with reviews)
- `src/modules/roadmap/ReviewModal.tsx` - NEW (review form)
- `src/modules/roadmap/RoadmapPageEnhanced.tsx` - NEW (full workflow)
- `src/modules/roadmap/WeekCard.tsx` - UPDATED
- `src/modules/roadmap/roadmapUiTypes.ts` - UPDATED

### Types
- `src/modules/roadmap/roadmapUiTypes.ts` - Added status, progressPercentage, notes

## Summary

The system now provides a unified progression experience where:
- Roadmaps drive the entire workflow
- Reviews capture learning outcomes
- Progress automatically synchronizes across all systems
- Dashboard and analytics reflect the complete picture
- Users can track mood, confidence, and difficulty trends
- All data persists locally in SQLite

This creates a cohesive personal trading progression and behavioral intelligence workspace.
