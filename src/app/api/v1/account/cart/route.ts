import { NextResponse } from 'next/server';
import { AuthError, requireUser, getAccount, syncCart, syncWishlist } from '@/features/auth/server';
import { mergeGuestSchema } from '@/features/auth/server';

export async function GET() {
  try {
    const user = await requireUser();
    const account = await getAccount(user.id);
    return NextResponse.json({
      data: { cart: account.cart, wishlist: account.wishlist },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'SYNC_FAILED', message: 'Unable to load cart' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = mergeGuestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid cart payload',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    await syncCart(user.id, parsed.data.cart);
    await syncWishlist(user.id, parsed.data.wishlist);
    const account = await getAccount(user.id);

    return NextResponse.json({
      data: { cart: account.cart, wishlist: account.wishlist },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'SYNC_FAILED', message: 'Unable to sync' } },
      { status: 500 }
    );
  }
}
