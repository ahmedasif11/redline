import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/features/auth/server';
import {
  AdminError,
  inventoryUpdateSchema,
  updateInventory,
} from '@/features/admin/server';
import { InventoryError } from '@/features/commerce/inventory';

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = inventoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid inventory update',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const product = await updateInventory(parsed.data);
    return NextResponse.json({ data: { product } });
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
    if (error instanceof InventoryError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: {
          code: 'INVENTORY_UPDATE_FAILED',
          message: 'Unable to update inventory',
        },
      },
      { status: 500 }
    );
  }
}
