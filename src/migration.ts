import { Pool } from 'pg';
import { auth } from './auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

type User = SupabaseUser & {
  raw_user_meta_data: {
    avatar_url: string;
  };
  encrypted_password: string;
  email_confirmed_at: string;
  created_at: string;
  updated_at: string;
  identities: {
    provider: string;
    identity_data: {
      sub: string;
      email: string;
    };
    created_at: string;
    updated_at: string;
  }[];
};

const migrateFromSupabase = async () => {
  console.log('Starting migration from Supabase to Better Auth...');

  const ctx = await auth.$context;
  const db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Fetching users from Supabase...');
    const users = await db
      .query(
        `
        SELECT 
          u.*,
          COALESCE(
            json_agg(
              i.* ORDER BY i.id
            ) FILTER (WHERE i.id IS NOT NULL),
            '[]'::json
          ) as identities
        FROM auth.users u
        LEFT JOIN auth.identities i ON u.id = i.user_id
        GROUP BY u.id
        `,
      )
      .then((res) => res.rows as User[]);

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      if (!user.email) {
        console.log(`Skipping user without email`);
        continue;
      }

      try {
        console.log(`Migrating user ${user.email}...`);

        // Create user
        const newUser = await ctx.adapter.create({
          model: 'user',
          data: {
            email: user.email,
            name: user.email,
            emailVerified: !!user.email_confirmed_at,
            image: user.raw_user_meta_data?.avatar_url,
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
          },
        });

        console.log(`Created user with ID: ${newUser.id}`);

        // Migrate identities
        if (Array.isArray(user.identities)) {
          for (const identity of user.identities) {
            const existingAccounts = await ctx.internalAdapter.findAccounts(
              newUser.id,
            );

            if (identity.provider === 'email' && user.encrypted_password) {
              const hasCredential = existingAccounts.find(
                (account) => account.providerId === 'credential',
              );

              if (!hasCredential) {
                await ctx.adapter.create({
                  model: 'account',
                  data: {
                    userId: newUser.id,
                    providerId: 'credential',
                    accountId: newUser.id,
                    password: user.encrypted_password,
                    createdAt: new Date(user.created_at),
                    updatedAt: new Date(user.updated_at),
                  },
                });
                console.log(`Created email credential for user ${user.email}`);
              }
            }

            const supportedProviders = Object.keys(
              ctx.options.socialProviders || {},
            );
            if (supportedProviders.includes(identity.provider)) {
              const hasAccount = existingAccounts.find(
                (account) => account.providerId === identity.provider,
              );

              if (!hasAccount && identity.identity_data?.sub) {
                await ctx.adapter.create({
                  model: 'account',
                  data: {
                    userId: newUser.id,
                    providerId: identity.provider,
                    accountId: identity.identity_data.sub,
                    createdAt: new Date(identity.created_at ?? user.created_at),
                    updatedAt: new Date(identity.updated_at ?? user.updated_at),
                  },
                });
                console.log(
                  `Created ${identity.provider} account for user ${user.email}`,
                );
              }
            }
          }
        }

        console.log(`Successfully migrated user ${user.email}`);
      } catch (error) {
        console.error(`Failed to migrate user ${user.email}:`, error);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
};

migrateFromSupabase().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
