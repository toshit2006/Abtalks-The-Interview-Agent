import { createFileRoute } from "@tanstack/react-router";
import { generateToken, getDb, hashPassword, initDbSchema } from "@/lib/db";

type AuthAction = "signup" | "signin" | "signout" | "me";

export interface AuthRequest {
  action: AuthAction;
  email?: string;
  password?: string;
  name?: string;
  token?: string;
}

export async function handleAuthRoute(request: Request) {
  await initDbSchema();
  const sql = getDb();
  if (!sql) {
    return Response.json({ error: "Database not configured or unreachable." }, { status: 500 });
  }

  let body: AuthRequest;
  try {
    body = (await request.json()) as AuthRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action, email, password, name, token } = body;

  try {
    if (action === "signup") {
      if (!email || !password || !name) {
        return Response.json({ error: "Name, email and password required." }, { status: 400 });
      }
      const existing =
        (await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`) as {
          id: string;
        }[];
      if (existing.length > 0) {
        return Response.json(
          { error: "An account with this email already exists." },
          { status: 400 },
        );
      }

      const userId = `usr_${generateToken(12)}`;
      const passwordHash = await hashPassword(password);

      await sql`
        INSERT INTO users (id, email, name, password_hash, role)
        VALUES (${userId}, ${email.toLowerCase().trim()}, ${name.trim()}, ${passwordHash}, 'candidate')
      `;

      const sessionToken = generateToken(24);
      const sessionId = `sess_${generateToken(12)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await sql`
        INSERT INTO sessions (id, user_id, token, expires_at)
        VALUES (${sessionId}, ${userId}, ${sessionToken}, ${expiresAt})
      `;

      return Response.json({
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          role: "candidate",
        },
        token: sessionToken,
      });
    }

    if (action === "signin") {
      if (!email || !password) {
        return Response.json({ error: "Email and password required." }, { status: 400 });
      }
      const passwordHash = await hashPassword(password);
      const users = (await sql`
        SELECT id, email, name, role FROM users 
        WHERE email = ${email.toLowerCase().trim()} AND password_hash = ${passwordHash}
      `) as { id: string; email: string; name: string; role: string }[];

      if (!users.length || !users[0]) {
        return Response.json({ error: "Invalid email or password." }, { status: 400 });
      }

      const user = users[0];
      const sessionToken = generateToken(24);
      const sessionId = `sess_${generateToken(12)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await sql`
        INSERT INTO sessions (id, user_id, token, expires_at)
        VALUES (${sessionId}, ${user.id}, ${sessionToken}, ${expiresAt})
      `;

      return Response.json({
        user,
        token: sessionToken,
      });
    }

    if (action === "me") {
      if (!token) {
        return Response.json({ user: null });
      }
      const sessions = (await sql`
        SELECT s.user_id, u.email, u.name, u.role, s.expires_at 
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ${token}
      `) as { user_id: string; email: string; name: string; role: string; expires_at: string }[];

      if (!sessions.length || !sessions[0] || new Date(sessions[0].expires_at) < new Date()) {
        return Response.json({ user: null });
      }

      const s = sessions[0];
      const userHistory = await sql`
        SELECT session_id, candidate_name, job_role, overall_score, created_at
        FROM interview_history
        WHERE user_id = ${s.user_id}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      return Response.json({
        user: { id: s.user_id, email: s.email, name: s.name, role: s.role },
        history: userHistory,
      });
    }

    if (action === "signout") {
      if (token) {
        await sql`DELETE FROM sessions WHERE token = ${token}`;
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: "Unknown auth action." }, { status: 400 });
  } catch (err) {
    console.error("Auth handler error:", err);
    return Response.json({ error: "Authentication request failed." }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/auth")({
  server: {
    handlers: {
      POST: ({ request }) => handleAuthRoute(request),
    },
  },
});
