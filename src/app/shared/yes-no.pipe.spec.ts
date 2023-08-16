import { YesNoPipe } from './yes-no.pipe';

describe('YesNoPipe', () => {
  it('creates', () => {
    const pipe = new YesNoPipe();
    expect(pipe).toBeTruthy();
  });

  it('transforms null to no', () => {
    const pipe = new YesNoPipe();
    expect(pipe.transform(null)).toBe('No');
  });

  it('transforms undefined to no', () => {
    const pipe = new YesNoPipe();
    expect(pipe.transform(undefined)).toBe('No');
  });

  it('transforms false to no', () => {
    const pipe = new YesNoPipe();
    expect(pipe.transform(false)).toBe('No');
  });

  it('transforms true to Yes', () => {
    const pipe = new YesNoPipe();
    expect(pipe.transform(true)).toBe('Yes');
  });
});
