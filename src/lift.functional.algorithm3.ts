import { Option, None, Some } from 'tsoption'
import { Direction, Floor, /*EpochTime,*/ 
  LiftRequests, Lift } from './lift.functional'


interface SystemState {
  lift: Lift,
  direction: Direction, // last move direction of lift
  liftRequests: LiftRequests,
}

const above = (a: number,b: number) => (a > b)
const below = (a: number,b: number) => (a < b)
const minimum = (a: number, b: number) => (a - b)
const maximum = (a: number, b: number) => (b - a)

const getMatchInListsFromBoundary =
  (l1: number[],
  l2: number[],
  boundary: number,
  filterOp: (a: number, b: number) => boolean,
  sortOp: (a: number, b: number) => number
  )
  : Option<number> => {
      const l1b = l1.filter(x => filterOp(x, boundary)).sort(sortOp);
      const l2b = l2.filter(x => filterOp(x, boundary)).sort(sortOp);
      const result = l1b.find(r => l2b.includes(r));
    return Option.of<number>(result);
  }

const getLiftMoveStrategy = (state: SystemState): Option<Floor> => {

      const floorRequestAbove = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.lift.floorRequests.map(r => r.floor),
        state.lift.floor,
        above,
        minimum
      );

      const liftRequestUpAbove = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.liftRequests.filter(r => r.direction === Direction.Up).map(r => r.onFloor),
        state.lift.floor,
        above, 
        minimum
      );

      const liftRequestDownAbove = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.liftRequests.filter(r => r.direction === Direction.Down).map(r => r.onFloor),
        state.lift.floor,
        above,
        maximum
      );

      const liftRequestDownBelow = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.liftRequests.filter(r => r.direction === Direction.Down).map(r => r.onFloor),
        state.lift.floor,
        below,
        maximum
      );

      const floorRequestBelow= getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.lift.floorRequests.map(r => r.floor),
        state.lift.floor,
        below,
        maximum
      );

      const liftRequestUpBelow = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.liftRequests.filter(r => r.direction === Direction.Up).map(r => r.onFloor),
        state.lift.floor,
        below,
        minimum
      );

  switch (state.direction) {
    case Direction.Up: {
      return getFirstSome([
        listOp(optionListToList([floorRequestAbove, liftRequestUpAbove]),Math.min),
        liftRequestDownAbove,
        listOp(optionListToList([liftRequestDownBelow, floorRequestBelow]),Math.max),
        liftRequestUpBelow
      ]);
    }
    case Direction.Down: {
      return getFirstSome([
        listOp(optionListToList([floorRequestBelow, liftRequestDownBelow]),Math.min),
        liftRequestUpBelow,
        listOp(optionListToList([liftRequestUpAbove, floorRequestAbove]),Math.max),
        liftRequestDownAbove
      ]);
    }
    default:
      return new None();
  }
}

const prependIfSome = <T>(acc: T[], next: Option<T>) => next.map(n => [n, ...acc]).getOrElse(acc);

const optionListToList = <T>(tOptions: Option<T>[]): T[] => {
  return tOptions.reduce((acc: T[], next: Option<T>) => prependIfSome(acc, next), []);
}


const listOp = (ns: number[], f: (a: number, b: number) => number): Option<number> => {
  if (ns.length === 0) {
    return new None();
  }
  const [head, ...tail] = ns;
  const result = tail.reduce((acc,next) => f(acc, next), head);
  return Some.of(result);
}

const getSome = <T>(opt1: Option<T>, opt2: Option<T>): Option<T> => {
  return !(opt1.isEmpty())? opt1: opt2;
}

const getFirstSome = <T>(l: Option<T>[]): Option<T> => l.reduce(getSome, new None);

export {SystemState, getLiftMoveStrategy,getMatchInListsFromBoundary, listOp};

