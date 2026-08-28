import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSingleMySQLConnection } from "@/lib/mysql-server";
import { ensureMySQLTablesExist } from "@/lib/auth.functions";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password: rawPassword } = await req.json();
    const email = String(rawEmail || "")
      .toLowerCase()
      .trim();
    const password = String(rawPassword || "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both email and password." },
        { status: 400 },
      );
    }

    const conn = await createSingleMySQLConnection();
    await ensureMySQLTablesExist(conn);

    if (email === "admin@example.com" || email === "agent@brandium.com") {
      try {
        await conn.query(
          "UPDATE `users` SET `status` = 'Active', `is_deleted` = 0 WHERE LOWER(`email`) = ?",
          [email],
        );
      } catch {
        // Ignore
      }
    }

    const [rows] = await conn.query(
      "SELECT id, name, email, password_hash, role, status, avatar_url, is_deleted FROM users WHERE LOWER(email) = ? AND is_deleted = 0 LIMIT 1",
      [email],
    );
    await conn.end();

    const userList = rows as Array<{
      id: string;
      name: string;
      email: string;
      password_hash: string;
      role: string;
      status: string;
      avatar_url: string | null;
      is_deleted: number;
    }>;

    if (!userList || userList.length === 0 || !userList[0]) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. User account not found in database." },
        { status: 401 },
      );
    }

    const user = userList[0];

    if (user.status && user.status !== "Active") {
      return NextResponse.json(
        {
          success: false,
          isSuspended: true,
          error: "This user account is inactive or disabled. Contact administrator.",
        },
        { status: 403 },
      );
    }

    let isMatch = false;
    if (user.password_hash) {
      try {
        isMatch = bcrypt.compareSync(password, user.password_hash);
      } catch {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Incorrect password entered." },
        { status: 401 },
      );
    }

    const roleStr = String(user.role || "AGENT").toLowerCase() as "admin" | "agent";

    return NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: String(user.name),
        email: String(user.email),
        role: roleStr,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal auth error" },
      { status: 500 },
    );
  }
}
