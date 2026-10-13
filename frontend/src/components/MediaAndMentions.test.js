import { describe, it, expect } from 'vitest';
import { getYouTubeEmbedUrl } from './MediaGrid';

describe('MediaGrid utilities', () => {
  it('extracts youtube embed URL from standard watch link', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('extracts youtube embed URL from short youtu.be link', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('extracts youtube embed URL from shorts link', () => {
    const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('returns null for non-youtube URLs', () => {
    expect(getYouTubeEmbedUrl('https://google.com')).toBeNull();
    expect(getYouTubeEmbedUrl('')).toBeNull();
  });
});
