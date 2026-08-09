import { NextResponse } from 'next/server';
import {
  AuthError,
  registerSchema,
  registerUser,
  mergeGuestData,
  mergeGuestSchema,
} from '@/features/auth/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guest, ...rest } = body as {
      guest?: { cart?: unknown; wishlist?: unknown };
      name?: string;
      email?: string;
      password?: string;
    };

    const parsed = registerSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration details',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const user = await registerUser(parsed.data);

    const guestParsed = mergeGuestSchema.safeParse(guest ?? {});
    if (guestParsed.success) {
      await mergeGuestData(
        user.id,
        guestParsed.data.cart,
        guestParsed.data.wishlist
      );
    }

    return NextResponse.json({ data: { user } }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    console.error('[auth/register]', error);
    return NextResponse.json(
      { error: { code: 'REGISTER_FAILED', message: 'Unable to register' } },
      { status: 500 }
    );
  }
}
