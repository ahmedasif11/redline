import { NextResponse } from 'next/server';
import { getCurrentUser, getAccount } from '@/features/auth/server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ data: { user: null } });
  }

  const account = await getAccount(user.id);
  return NextResponse.json({
    data: {
      user,
      cart: account.cart,
      wishlist: account.wishlist,
      addresses: account.addresses,
    },
  });
}
