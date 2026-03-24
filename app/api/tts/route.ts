import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const VOICE = 'en-US-JennyNeural';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  return new Promise<NextResponse>((resolve) => {
    const { audioStream } = tts.toStream(text);
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
