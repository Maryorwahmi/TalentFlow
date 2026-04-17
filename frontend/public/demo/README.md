# TalentFlow Demo Video

## Directory Structure
This directory holds the demo video asset for the TalentFlow product demo page.

## Video Asset
**Expected file**: `talentflow-demo.mp4`
- **Format**: MP4 video file
- **Resolution**: 1920x1080 (Full HD) recommended
- **Aspect Ratio**: 16:9
- **Codec**: H.264 video, AAC audio
- **File size**: Keep under 100MB for optimal loading

## Content Guidelines
The demo video should cover:
1. **Learner Flow** (~60 seconds)
   - Dashboard overview
   - Browsing course catalog
   - Enrolling in a course
   - Viewing lessons and progress
   - Submitting assignments

2. **Instructor Flow** (~60 seconds)
   - Dashboard overview
   - Creating/managing courses
   - Viewing learner submissions
   - Grading assignments
   - Viewing analytics

3. **Admin Flow** (~60 seconds)
   - Platform dashboard
   - User management
   - Course approval workflow
   - Analytics and metrics
   - System settings

## Current Status
🔶 **Placeholder Directory Ready** - Awaiting final demo video export

## Integration
- The DemoPage component (`src/app/public/DemoPage.tsx`) references this video
- Served as static asset via `/demo/talentflow-demo.mp4` route
- Video player includes controls and poster image

## Next Steps
1. Export final walkthrough video from screen recording session
2. Export video as MP4 (H.264/AAC)
3. Place in this directory as `talentflow-demo.mp4`
4. Test playback on DemoPage (`/demo` route)
5. Verify video plays correctly across browsers and devices
