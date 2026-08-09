import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/features/auth/server';
import { listAdminCustomers } from '@/features/admin/server';

export async function GET() {
  try {
    await requireAdmin();
    const customers = await listAdminCustomers();
    return NextResponse.json({ data: { customers } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: {
          code: 'CUSTOMERS_FAILED',
          message: 'Unable to load customers',
        },
      },
      { status: 500 }
    );
  }
}
