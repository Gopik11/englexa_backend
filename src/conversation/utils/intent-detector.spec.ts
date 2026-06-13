import { detectIntent } from './intent-detector';

describe('intent-detector', () => {
  it('detects greeting intent', () => {
    expect(detectIntent('Hello, how are you?')).toBe('greeting');
  });

  it('detects travel intent', () => {
    expect(detectIntent('I took a flight to Paris last summer.')).toBe('travel');
  });

  it('detects food intent', () => {
    expect(detectIntent('I love cooking pasta for dinner.')).toBe('food');
  });

  it('defaults to daily conversation', () => {
    expect(detectIntent('It was a quiet afternoon.')).toBe('daily_conversation');
  });
});
