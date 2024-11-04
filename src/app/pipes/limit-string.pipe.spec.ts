import { LimitStringPipe } from './limit-string.pipe';

describe('LimitStringPipe', () => {
  const pipe = new LimitStringPipe();

  it('Returns null for falsy string', () => {
    expect(pipe.transform("")).toBeNull();
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('Shortens 51 character long string using ...', () => {
    const longString: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
    const shortenedString: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTU...";
    const transformedString: string | null = pipe.transform(longString);
    expect(transformedString).toBe(shortenedString);
    expect(transformedString!.substring(transformedString!.length - 2, transformedString!.length)).toBe("...");

  });

  it('Does not shorten sub-50 character long string'), () => {
    expect(pipe.transform("Short string")).toBe("Short string");
  }

});
