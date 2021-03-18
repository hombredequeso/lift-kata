import { Option, None, Some} from 'tsoption'
import {SemiGroup, MinSemiGroup, MaxSemiGroup, OptionMonoid} from './monoid';

test.each([
  ['a< b', 1, 2, 1],
  ['a > b', 2, 1, 1],
  ['a = b', 1, 1, 1]
])('MinMonoid.mappend: %p', (testName, a,b, expected) => {
  const sg = new MinSemiGroup();
  expect(sg.combine(a, b)).toEqual(expected);
});


test.each([
  ['None, None', None.of<number>(), None.of<number>(), None.of<number>()],
  ['None, Some', None.of<number>(), Some.of(1), Some.of(1)],
  ['Some, None', Some.of(1), None.of<number>(), Some.of(1)],
  ['Some, Some v1', Some.of(2), Some.of(1), Some.of(1)],
  ['Some, Some v2', Some.of(1), Some.of(2), Some.of(1)]
])('OptionMonoid.mappend: %p', (testName, a: Option<number>,b: Option<number>, expected: Option<number>) => {
  const monoid = new OptionMonoid(new MinSemiGroup());
  expect(monoid.combine(a, b)).toEqual(expected);
});
