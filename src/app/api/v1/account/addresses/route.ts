import { NextResponse } from 'next/server';
import {
  AuthError,
  requireUser,
  getAccount,
  addAddress,
  deleteAddress,
  addressSchema,
} from '@/features/auth/server';

export async function GET() {
  try {
    const user = await requireUser();
    const account = await getAccount(user.id);
    return NextResponse.json({ data: { addresses: account.addresses } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'ADDRESSES_FAILED', message: 'Unable to load addresses' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid address',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const addresses = await addAddress(user.id, {
      label: data.label,
      fullName: data.fullName,
      line1: data.line1,
      line2: data.line2 || undefined,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone || undefined,
      isDefault: data.isDefault ?? false,
    });

    return NextResponse.json({ data: { addresses } }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'ADDRESS_CREATE_FAILED', message: 'Unable to save' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Address id required' } },
        { status: 400 }
      );
    }
    const addresses = await deleteAddress(user.id, id);
    return NextResponse.json({ data: { addresses } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'ADDRESS_DELETE_FAILED', message: 'Unable to delete' } },
      { status: 500 }
    );
  }
}
