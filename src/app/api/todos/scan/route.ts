import { NextResponse } from 'next/server'
import { ManualScanService } from '@/services/ingestion/manual-scan'

export async function POST() {
  try {
    const scanner = new ManualScanService()
    const result = await scanner.scanAll()

    return NextResponse.json({
      success: result.success,
      message: `Scanned ${result.scannedFiles} files in ${result.duration}ms`,
      data: result
    })
  } catch (error: any) {
    console.error('Scan error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Allow GET for easier testing from browser
  return POST()
}
