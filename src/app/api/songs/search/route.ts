import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

function decryptMediaUrl(encryptedUrl?: string): string {
  if (!encryptedUrl) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
    });
    const decrypted = CryptoJS.DES.decrypt(
      cipherParams,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    let url = decrypted.toString(CryptoJS.enc.Utf8);
    if (url) {
      url = url.replace('_96.mp4', '_160.mp4');
    }
    return url;
  } catch (e) {
    return '';
  }
}

function cleanHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const language = searchParams.get('lang') || 'Kannada';
  const mood = searchParams.get('mood') || '';

  // Build intelligent multi-language search query
  let searchQuery = '';
  if (q) {
    searchQuery = language && language !== 'All' ? `${q} ${language}` : q;
  } else if (mood) {
    searchQuery = language && language !== 'All' ? `${language} ${mood} songs` : `${mood} songs`;
  } else {
    searchQuery = language && language !== 'All' ? `${language} top hits trending` : 'top trending hits';
  }

  try {
    const targetUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=30&p=1&q=${encodeURIComponent(
      searchQuery
    )}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }

    const data = await res.json();
    const rawResults = data.results || [];

    const tracks = rawResults
      .map((r: any) => {
        const streamUrl = decryptMediaUrl(r.more_info?.encrypted_media_url);
        if (!streamUrl) return null;

        const rawArtwork = r.image || '';
        const artwork = rawArtwork.replace('150x150', '500x500');

        return {
          id: r.id,
          title: cleanHtmlEntities(r.title),
          artist: cleanHtmlEntities(r.more_info?.singers || r.subtitle || 'Artist'),
          album: cleanHtmlEntities(r.more_info?.album || 'Single'),
          duration: Number(r.more_info?.duration || 240),
          artwork: artwork || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
          audioUrl: streamUrl,
          language: r.language ? r.language.charAt(0).toUpperCase() + r.language.slice(1) : language,
          genre: mood ? `${mood} Melody` : 'Universal Hits',
          source: 'swany',
          sourceId: r.id,
          year: r.year ? Number(r.year) : undefined,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ results: tracks });
  } catch (err: any) {
    console.error('Error fetching live Kannada songs:', err);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
