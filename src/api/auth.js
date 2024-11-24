import WorkOS from '@workos-inc/node';

const workos = new WorkOS(process.env.VITE_WORKOS_API_KEY);

export async function handleCallback(req, res) {
  const { code } = req.body;

  try {
    const { user } = await workos.sso.getProfileAndToken({
      code,
      clientId: process.env.VITE_WORKOS_CLIENT_ID,
    });

    // Generate a JWT token for Convex
    const token = await workos.jwt.generate({
      sub: user.id,
      aud: ["workos"],
      organization: user.organization_id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organization_id,
      },
    };
  } catch (error) {
    console.error('WorkOS authentication error:', error);
    throw error;
  }
}

export async function getUser(token) {
  try {
    const profile = await workos.sso.getProfile(token);
    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      organizationId: profile.organization_id,
    };
  } catch (error) {
    console.error('Error fetching WorkOS profile:', error);
    throw error;
  }
}
