import { NextResponse } from 'next/server';

// Minimal API route placeholder for Gemini calls.
// This file was empty which caused the build to treat it as not-a-module.
// Implement simple handlers so the module is valid. Replace with real logic
// or move sensitive API calls to server code as needed.

export async function GET() {
	return NextResponse.json({ message: 'Gemini API route placeholder' });
}

export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => null);
		// For now, just echo back minimal info. Real implementation should
		// proxy to the Gemini server-side API and sanitize responses.
		return NextResponse.json({ received: !!body });
		} catch {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		}
}
