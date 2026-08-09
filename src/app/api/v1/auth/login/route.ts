import { NextResponse } from 'next/server';
import {
  AuthError,
  ensureAdminFromEnv,
  loginSchema,
  loginUser,
  mergeGuestData,
  mergeGuestSchema,
  getAccount,
} from '@/features/auth/server';

export async function POST(request: Request) {
  try {
    await ensureAdminFromEnv();
    const body = await request.json();
    const { guest, ...rest } = body as {
      guest?: { cart?: unknown; wishlist?: unknown };
      email?: string;
      password?: string;
    };

    const parsed = loginSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid login details',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const user = await loginUser(parsed.data);

    const guestParsed = mergeGuestSchema.safeParse(guest ?? {});
    if (guestParsed.success) {
      await mergeGuestData(
        user.id,
        guestParsed.data.cart,
        guestParsed.data.wishlist
      );
    }

    const account = await getAccount(user.id);

    return NextResponse.json({
      data: {
        user,
        cart: account.cart,
        wishlist: account.wishlist,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    console.error('[auth/login]', error);
    return NextResponse.json(
      { error: { code: 'LOGIN_FAILED', message: 'Unable to sign in' } },
      { status: 500 }
    );
  }
}
