import { Pool } from 'pg';
import { auth } from './auth';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
  };
};

const migrateFromSupabase = async () => {
  const ctx = await auth.$context;
  const db = ctx.options.database as Pool;
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
  for (const user of users) {
    if (!user.email) {
      continue;
    }
    await ctx.adapter
      .create({
        model: 'user',
        data: {
          //   id: user.id,
          email: user.email,
          name: user.email,
          emailVerified: !!user.email_confirmed_at,
          image: user.raw_user_meta_data.avatar_url,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
        },
      })
      .catch(() => {});
    for (const identity of user.identities) {
      const existingAccounts = await ctx.internalAdapter.findAccounts(user.id);

      if (identity.provider === 'email') {
        const hasCredential = existingAccounts.find(
          (account) => account.providerId === 'credential',
        );
        if (!hasCredential) {
          await ctx.adapter
            .create({
              model: 'account',
              data: {
                userId: user.id,
                providerId: 'credential',
                accountId: user.id,
                password: user.encrypted_password,
                createdAt: new Date(user.created_at),
                updatedAt: new Date(user.updated_at),
              },
            })
            .catch(() => {});
        }
      }
      const supportedProviders = Object.keys(ctx.options.socialProviders || {});
      if (supportedProviders.includes(identity.provider)) {
        const hasAccount = existingAccounts.find(
          (account) => account.providerId === identity.provider,
        );
        if (!hasAccount) {
          await ctx.adapter.create({
            model: 'account',
            data: {
              userId: user.id,
              providerId: identity.provider,
              accountId: identity.identity_data?.sub,
              createdAt: new Date(identity.created_at ?? user.created_at),
              updatedAt: new Date(identity.updated_at ?? user.updated_at),
            },
          });
        }
      }
    }
  }
};
migrateFromSupabase().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
