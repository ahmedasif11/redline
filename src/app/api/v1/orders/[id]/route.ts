import { NextResponse } from 'next/server';
import { getOrderById } from '@/features/commerce/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Order "${id}" not found`,
        },
      },
      { status: 404 }
    );
  }

  // Public confirmation payload — omit nothing sensitive beyond address
  // which the buyer already knows.
  return NextResponse.json({ data: order });
}
