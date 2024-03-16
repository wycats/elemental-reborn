import { OAuth2Client } from 'google-auth-library';

export async function verifyGoogleToken(token: string) {
  const client = new OAuth2Client(
    '577698328125-ldg1e1oolcm01e5pnjkboshfslk7c1pk.apps.googleusercontent.com'
  );
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '577698328125-ldg1e1oolcm01e5pnjkboshfslk7c1pk.apps.googleusercontent.com'
    });
    const payload = ticket.getPayload();
    if (payload) {
      const userId = payload.sub;
      return userId;
    }
    return null;
  } catch {
    return null;
  }
}
