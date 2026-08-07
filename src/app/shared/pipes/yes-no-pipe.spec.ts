import { YesNoPipe } from './yes-no-pipe';

describe('YesNoPipe', () => {
  const pipe = new YesNoPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms true to "Yes"', () => {
    expect(pipe.transform(true)).toBe('Yes');
  });

  it('transforms false to be "No"', () => {
    expect(pipe.transform(false)).toBe('No');
  });
});
