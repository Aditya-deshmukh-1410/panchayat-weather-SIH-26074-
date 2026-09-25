import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'panchayat-frontend',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    phase: 'Phase 1 - Monorepo Scaffolding & Health Verification'
  });
}
