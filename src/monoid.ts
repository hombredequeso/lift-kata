
import { Option, None, Some} from 'tsoption'

interface SemiGroup<T> {
  combine(a: T, b: T): T
}

class MinSemiGroup implements SemiGroup<number> {
  combine(a: number, b: number): number {
    return Math.min(a,b);
  }
}


class MaxSemiGroup implements SemiGroup<number> {
  combine(a: number, b: number): number {
    return Math.max(a,b);
  }
}

class FirstSemiGroup<T> implements SemiGroup<T> {
  combine(a: T, b: T): T {
    return a;
  }
}


class OptionMonoid<T> {
  constructor(tSemiGroup: SemiGroup<T>) {
    this.tSemiGroup = tSemiGroup;
  }
  
  tSemiGroup: SemiGroup<T>

  empty(): Option<T> { return None.of(); }
  combine(a: Option<T>, b: Option<T>): Option<T> {
    if (a.isEmpty()) {
      return b;
    }
    if (b.isEmpty()) {
      return a;
    }
    return a.flatMap(aa => 
      b.map((bb: T) => this.tSemiGroup.combine(aa, bb))
    );
  }
}

export {SemiGroup, MinSemiGroup, MaxSemiGroup, FirstSemiGroup, OptionMonoid};
