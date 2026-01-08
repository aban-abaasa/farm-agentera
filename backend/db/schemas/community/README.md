# Community Tables Schema

This directory contains the SQL files for creating the comprehensive community system for the AGRI-TECH platform. The files are designed to be executed in numerical order.

## Execution Order

The SQL files in this directory should be executed in the following order:

1. **01_forum_categories_and_tags.sql** - Creates forum categories and tags tables with RLS policies and seed data
2. **02_community_events.sql** - Creates community events and event participants tables
3. **03_community_posts.sql** - Creates community posts, comments, and related tables
4. **04_post_reactions.sql** - Creates reaction, bookmarks, shares, and likes tables
5. **05_qa_system.sql** - Creates Q&A system with questions, answers, and voting
6. **06_reputation_system.sql** - Creates user reputation, badges, and expert system
7. **07_moderation_notifications.sql** - Creates moderation, notifications, and opportunities tables
8. **08_functions.sql** - Creates database functions for various operations
9. **09_triggers.sql** - Creates database triggers for automated operations
10. **10_views_and_final_setup.sql** - Creates optimized views and completes setup

## Features Included

### Core Community Features
- ✅ Forum categories and subcategories
- ✅ Tagging system with trending tags
- ✅ Community posts with rich content support
- ✅ Threaded comments system
- ✅ Multiple reaction types (like, love, helpful, etc.)
- ✅ Post bookmarking and sharing

### Q&A System
- ✅ Question posting with categories
- ✅ Answer system with voting (upvote/downvote)
- ✅ Accepted answers functionality
- ✅ Question following system
- ✅ Expert answer marking

### Events System
- ✅ Community event creation and management
- ✅ Event registration and attendance tracking
- ✅ Event categories and pricing support
- ✅ Online and offline event support

### User Engagement
- ✅ User reputation system
- ✅ Achievement badges
- ✅ Expert verification system
- ✅ Community statistics and leaderboards

### Moderation & Safety
- ✅ Content reporting system
- ✅ Content moderation tools
- ✅ User notifications system
- ✅ Automated moderation policies

### Performance & Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Optimized database indexes
- ✅ Full-text search capabilities
- ✅ Denormalized counters for performance
- ✅ Database views for complex queries

## Usage

### Automatic Execution
Use the main database initialization script from the backend directory:

```bash
# Execute all community tables
node initialize_db.js community

# Execute with verbose output
node initialize_db.js --verbose community

# Execute all schemas including community
node initialize_db.js
```

### Manual Execution
If you need to execute files manually:

```bash
# From the backend directory
psql -d your_database -f db/schemas/community/01_forum_categories_and_tags.sql
psql -d your_database -f db/schemas/community/02_community_events.sql
# ... continue with remaining files in order
```

## Database Structure

### Main Tables
- `forum_categories` - Forum categories with hierarchy support
- `forum_tags` - Tagging system for content
- `community_posts` - Main posts table with rich content
- `post_comments` - Threaded comments system
- `community_questions` - Q&A questions
- `question_answers` - Q&A answers with voting
- `community_events` - Events system
- `user_reputation` - User reputation and points
- `community_badges` - Achievement system

### Interaction Tables
- `post_likes` / `comment_likes` - Simple like system
- `post_reactions` / `comment_reactions` - Multi-type reactions
- `post_bookmarks` - Save posts for later
- `post_shares` - Track sharing activity
- `answer_votes` - Q&A voting system

### Moderation Tables
- `community_reports` - Content reporting
- `content_moderations` - Moderation actions
- `community_notifications` - User notifications

## Security

All tables implement Row Level Security (RLS) with appropriate policies:
- Users can only edit their own content
- Public content is viewable by everyone
- Admin users have elevated permissions
- Sensitive operations require authentication

## Performance Considerations

The schema includes several performance optimizations:
- Denormalized counters (likes, views, comments)
- Strategic database indexes
- Full-text search indexes
- Optimized views for common queries
- Automatic trigger-based updates

## Customization

The schema is designed to be flexible and can be customized:
- Add new reaction types in the reaction tables
- Extend badge criteria in the `community_badges` table
- Add new event types or notification types
- Modify RLS policies for different permission models

## Troubleshooting

If you encounter issues:
1. Ensure you have proper database permissions
2. Check that the `profiles` table exists (from auth schema)
3. Verify PostgreSQL version supports the features used
4. Check the logs for specific error messages
5. Ensure all files are executed in the correct order

## Support

For issues or questions about the community schema:
1. Check the database logs for specific errors
2. Verify all prerequisite tables exist
3. Ensure proper environment variables are set
4. Review the RLS policies if access issues occur
