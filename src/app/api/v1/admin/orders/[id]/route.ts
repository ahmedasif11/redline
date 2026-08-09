import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/features/auth/server';
import {
  AdminError,
  orderStatusUpdateSchema,
  updateOrderStatus,
} from '@/features/admin/server';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order status',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, parsed.data.status);
    return NextResponse.json({ data: { order } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    if (error instanceof AdminError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: {
          code: 'ORDER_UPDATE_FAILED',
          message: 'Unable to update order',
        },
      },
      { status: 500 }
    );
  }
}
