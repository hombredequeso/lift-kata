import { Option, None, Some } from 'tsoption'
import {
  LiftRequests, Lift } from './lift.functional'
import {
  Direction, Floor
} from './events'
import {SemiGroup, MinSemiGroup, MaxSemiGroup, OptionMonoid, FirstSemiGroup} from './monoid';

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

  const minOptionMonoid = new OptionMonoid(new MinSemiGroup());
  const maxOptionMonoid = new OptionMonoid(new MaxSemiGroup());
  switch (state.direction) {
    case Direction.Up: {
      return getFirstSome([
        minOptionMonoid.combine(floorRequestAbove, liftRequestUpAbove),
        liftRequestDownAbove,
        maxOptionMonoid.combine(liftRequestDownBelow, floorRequestBelow),
        liftRequestUpBelow
      ]);
    }
    case Direction.Down: {
      return getFirstSome([
        minOptionMonoid.combine(floorRequestBelow, liftRequestDownBelow),
        liftRequestUpBelow,
        maxOptionMonoid.combine(liftRequestUpAbove, floorRequestAbove),
        liftRequestDownAbove
      ]);
    }
    default:
      return new None();
  }
}

const getFirstSome = <T>(l: Option<T>[]): Option<T> =>  {
  const optionFirstMonoid = new OptionMonoid(new FirstSemiGroup<T>());
  return l.reduce(
    (x,y) => optionFirstMonoid.combine(x,y), 
    optionFirstMonoid.empty());
}

export {SystemState, getLiftMoveStrategy,getMatchInListsFromBoundary};

