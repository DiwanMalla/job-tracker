import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/validations';
import { UserService } from '@/lib/services/user.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = signUpSchema.parse(body);

    const user = await UserService.create({
      email,
      name,
      password,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}