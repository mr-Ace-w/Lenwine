import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const correctPassword = process.env.ADMIN_PASSWORD || 'lenwine2026';

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Невірний пароль' }, { status: 401 });
  } catch (error) {
    console.error('Admin Auth Error:', error);
    return NextResponse.json({ success: false, error: 'Помилка авторизації' }, { status: 500 });
  }
}
