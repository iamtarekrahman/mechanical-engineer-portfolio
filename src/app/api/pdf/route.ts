import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// The requested résumé version is selected at request time.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const file = searchParams.get('file');

    // Validate file parameter
    if (!file || (file !== '1page' && file !== '2page')) {
      return NextResponse.json({ error: 'Invalid file parameter' }, { status: 400 });
    }

    // Map to actual file names
    const fileMap = {
      '1page': 'Tarek Rahman Resume-1 Page.pdf',
      '2page': 'Tarek Rahman Resume-2 Page.pdf',
    };

    const fileName = fileMap[file as '1page' | '2page'];
    const filePath = join(process.cwd(), 'public', fileName);

    // Read the PDF file
    const pdfBuffer = await readFile(filePath);

    // Return with Content-Disposition: inline to force browser display
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
