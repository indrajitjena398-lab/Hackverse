import { NextRequest, NextResponse } from 'next/server';
import zlib from 'zlib';
import { parseResumeText } from '@/lib/parser/resumeParser';

export const runtime = 'nodejs';

/**
 * Extracts plain text from a raw PDF buffer using stream decompression (FlateDecode)
 * and PDF text operator parsing without requiring heavy external binaries.
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
  const extractedChunks: string[] = [];

  // 1. Locate all streams in the PDF
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const rawString = buffer.toString('binary');
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(rawString)) !== null) {
    const streamContent = match[1];
    let decompressed: Buffer | null = null;

    // Try zlib inflate
    try {
      const streamBuf = Buffer.from(streamContent, 'binary');
      decompressed = zlib.inflateSync(streamBuf);
    } catch {
      try {
        // Some PDF producers omit zlib headers, try raw inflate
        const streamBuf = Buffer.from(streamContent, 'binary');
        decompressed = zlib.inflateRawSync(streamBuf);
      } catch {
        // Not compressed or unsupported compression
        decompressed = null;
      }
    }

    const textToSearch = decompressed ? decompressed.toString('utf-8') : streamContent;

    // Extract text commands: (Text) Tj, [(T) -10 (ext)] TJ
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(textToSearch)) !== null) {
      if (tjMatch[1] && tjMatch[1].trim()) {
        extractedChunks.push(cleanPdfString(tjMatch[1]));
      }
    }

    const arrayRegex = /\[([^\]]+)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = arrayRegex.exec(textToSearch)) !== null) {
      const inner = arrMatch[1];
      const stringParts = inner.match(/\(([^)]*)\)/g);
      if (stringParts) {
        const combined = stringParts
          .map(s => s.replace(/^\(|\)$/g, ''))
          .map(cleanPdfString)
          .join('');
        if (combined.trim()) {
          extractedChunks.push(combined);
        }
      }
    }
  }

  // 2. Direct string extraction fallback if streams were empty
  if (extractedChunks.length < 5) {
    const directRegex = /\(([A-Za-z0-9\s.,/@:;_-]{3,})\)\s*Tj/g;
    let dMatch: RegExpExecArray | null;
    while ((dMatch = directRegex.exec(rawString)) !== null) {
      extractedChunks.push(cleanPdfString(dMatch[1]));
    }
  }

  // 3. Fallback: extract continuous ASCII strings from buffer
  if (extractedChunks.length < 5) {
    const asciiRegex = /[A-Za-z0-9][A-Za-z0-9\s.,/@:;_-]{4,}[A-Za-z0-9]/g;
    const matches = rawString.match(asciiRegex) || [];
    const validWords = matches.filter(w => !w.startsWith('PDF') && !w.startsWith('obj') && !w.includes('Font'));
    extractedChunks.push(...validWords);
  }

  return extractedChunks.join('\n');
}

function cleanPdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawTextBody = formData.get('text') as string | null;

    let textToParse = '';
    let fileName = 'Uploaded_Resume.pdf';

    if (file) {
      fileName = file.name || fileName;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileName.toLowerCase().endsWith('.pdf')) {
        textToParse = extractTextFromPdfBuffer(buffer);
      } else {
        // Plain text, markdown, or json
        textToParse = buffer.toString('utf-8');
      }
    } else if (rawTextBody) {
      textToParse = rawTextBody;
    } else {
      return NextResponse.json(
        { error: 'No resume file or text provided in request' },
        { status: 400 }
      );
    }

    if (!textToParse || textToParse.trim().length < 15) {
      return NextResponse.json(
        { error: 'Could not extract readable text from the uploaded file. Please ensure it is not an image-only scan or upload as .txt.' },
        { status: 422 }
      );
    }

    const parsedData = parseResumeText(textToParse, fileName);

    return NextResponse.json({
      success: true,
      message: 'Resume parsed and calibrated successfully',
      data: parsedData,
    });
  } catch (err: any) {
    console.error('Error parsing resume upload:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while processing resume' },
      { status: 500 }
    );
  }
}
