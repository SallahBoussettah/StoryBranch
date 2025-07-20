# Database Setup with Prisma

This directory contains the Prisma schema and migrations for the Interactive Branching Stories platform.

## Database Schema

The database schema is defined in `schema.prisma` and includes the following models:

- User: User accounts with roles (reader, writer, admin)
- Story: Interactive stories created by writers
- Node: Story points containing content and choices
- Choice: Options that connect nodes in the story
- Progress: Tracks reader progress through stories
- Achievement: Defines achievements that can be earned
- UserAchievement: Records achievements earned by users

## Connection Information

- Database: PostgreSQL
- Database Name: storyBranch
- Username: postgres
- Password: Stored in .env file
- Connection URL format: `postgresql://username:password@localhost:5432/storyBranch`

## Connection Pooling

Connection pooling is handled automatically by Prisma Client, which maintains a pool of connections to optimize performance.

## Useful Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create a new migration
npm run prisma:migrate -- --name <migration_name>

# Apply pending migrations
npm run prisma:migrate

# Test database connection
npm run test:db
```

## Migrations

Migrations are stored in the `prisma/migrations` directory. Each migration has:

- A timestamp-based directory name
- A `migration.sql` file containing the SQL commands
- The initial migration (`init`) creates all tables and relationships

## Adding New Models

To add new models:

1. Update the `schema.prisma` file with the new model definition
2. Run `npm run prisma:migrate -- --name add_new_model` to create a migration
3. The Prisma client will be automatically regenerated

## Troubleshooting

If you encounter database connection issues:

1. Verify PostgreSQL is running
2. Check the connection string in the `.env` file
3. Run `npm run test:db` to test the connection
4. Check the logs for specific error messages