import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const VOICE = 'en-US-JennyNeural';

function sanitizeForSpeech(raw: string): string {
  return raw
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<\/\w+>/g, ' ')
    .replace(/<(\w+)[^>]*>/g, '$1 ')
    .replace(/[<>&"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const safeText = sanitizeForSpeech(text);

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  return new Promise<NextResponse>((resolve) => {
    const { audioStream } = tts.toStream(safeText);
    const chunks: Buffer[] = [];

    audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    audioStream.on('end', () => {
      resolve(
        new NextResponse(Buffer.concat(chunks), {
          headers: { 'Content-Type': 'audio/mpeg' },
        }),
      );
    });
    audioStream.on('error', () => {
      resolve(NextResponse.json({ error: 'TTS generation failed' }, { status: 500 }));
    });
  });
}
