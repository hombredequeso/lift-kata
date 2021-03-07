import { Option, None, Some } from 'tsoption'
import { Direction, Floor, /*EpochTime,*/ 
  LiftRequests, Lift } from './lift.functional'


interface SystemState {
  lift: Lift,
  direction: Direction, // last move direction of lift
  liftRequests: LiftRequests,
}

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

const above = (a: number,b: number) => (a > b)
const below = (a: number,b: number) => (a < b)
const minimum = (a: number, b: number) => (a - b)
const maximum = (a: number, b: number) => (b - a)

const getLiftMoveStrategy = (state: SystemState): Option<Floor> => {
  switch (state.direction) {
    case Direction.Up: {
  // if lift direction up, get first Some from:
  //  * min (firstLiftRequest(up, >), firstFloorRequest(>)) -- done
  //  * firstLiftRequest(down, >)                           -- done
  //  * max (firstLiftRequest(down, <), firstFloorRequest(<))
  //  * firstLiftRequest(up, <)
      
      const floorRequestMatch = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.lift.floorRequests.map(r => r.floor),
        state.lift.floor,
        above,
        minimum
      );

      //
      const liftRequestMatch = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.liftRequests.filter(r => r.direction === Direction.Up).map(r => r.onFloor),
        state.lift.floor,
        above, 
        minimum
      );

      const liftRequestGoingDownMatchMax = getMatchInListsFromBoundary(
        state.lift.availableFloors,
        state.liftRequests.filter(r => r.direction === Direction.Down).map(r => r.onFloor),
        state.lift.floor,
        above,
        maximum
      );

      return getFirstSome([
        listOp(optionListToList([floorRequestMatch, liftRequestMatch]),Math.min),
        liftRequestGoingDownMatchMax
      ]);
    }
    case Direction.Down: {
      return new None();
    }
    default:
      return new None();
  }
}

const optionListToList = <T>(tOptions: Option<T>[]): T[] => {
  return tOptions.reduce((acc: T[], next: Option<T>) => {
    return next.map(n => [n, ...acc]).getOrElse(acc);
  },
  []);
}

const listOp = (ns: number[], f: (a: number, b: number) => number): Option<number> => {
  return ns.reduce((accOption: Option<number>, next: number) => {
    if (accOption.isEmpty()) {
      return Some.of(next);
    }
    return accOption.map(acc => f(acc, next));
  }, new None())
}

const getSome = <T>(opt1: Option<T>, opt2: Option<T>): Option<T> => {
  return !(opt1.isEmpty())? opt1: opt2;
}

const getFirstSome = <T>(l: Option<T>[]): Option<T> => l.reduce(getSome, new None);

export {SystemState, getLiftMoveStrategy,getMatchInListsFromBoundary, listOp};

