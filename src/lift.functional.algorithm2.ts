import { Option, None } from 'tsoption'
import { Direction, Floor, /*EpochTime,*/ 
  LiftRequests, Lift } from './lift.functional'


interface SystemState {
  lift: Lift,
  direction: Option<Direction>,
    liftRequests: LiftRequests,
}

const firstInList = <T>(l: T[]) : Option<T> => {
  return (l.length)? 
    Option.of(l[0])
    : new None;
}

// Option semigroup:
const optionSemiGroup = <T>(aO: Option<T>, bO: Option<T>, f: (x: T, y: T) => T) : Option<T> => {
  return aO.flatMap(a => bO.map(b => f(a,b)));
}

const gt = (a: number, b: number) => a > b;
const lt = (a: number, b: number) => a < b;

const forwardSort = (a: number, b: number) => a -b;
const reverseSort = (a: number, b: number) => b - a;

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
      const result = l1b.find(r => l2b.includes(r))
    return Option.of<number>(result);
  }

const getNextFloorRequest = 
  (lift: Lift,
    direction: Direction)
  : Option<Floor> => {
    switch (direction) {
      case Direction.Up: {
        return getMatchInListsFromBoundary(
          lift.floorRequests.map(r => r.floor),
          lift.availableFloors,
          lift.floor,
          gt,
          forwardSort);
      }
      case Direction.Down: {
        return getMatchInListsFromBoundary(
          lift.floorRequests.map(r => r.floor),
          lift.availableFloors,
          lift.floor,
          lt,
          reverseSort);
      }
    }

    return new None();
  }


const getNext =
  (lift: Lift, 
    liftRequests: LiftRequests, 
    d: Direction,
    op1: (a: number, b: number) => boolean,
    requestDirection: Direction,
    sorter: (a: number, b: number) => number
  )
  : Option<Floor> => {
        const requestedFloorsAbove = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(liftRequests.filter(r => r.direction === requestDirection).map(r => r.onFloor))
          .filter(f => op1(f, lift.floor))
          .sort(sorter);
        return firstInList(requestedFloorsAbove)
  }

const getNextFloorInDirection = 
  (lift: Lift, 
    liftRequests: LiftRequests, 
    d: Direction)
  : Option<Floor> => {
    switch (d) {
      case Direction.Up: {
        return getNext(lift, liftRequests, d, gt, Direction.Up, forwardSort);
      }
      case Direction.Down: {
        return getNext(lift, liftRequests, d, lt, Direction.Down, reverseSort);
      }
    }
  };

const getNextFloorInDirectionRequestedOpposite = 
  (lift: Lift, 
    liftRequests: LiftRequests, 
    d: Direction)
  : Option<Floor> => {
    switch (d) {
      case Direction.Up: {
        return getNext(lift, liftRequests, d, gt, Direction.Down, reverseSort);
      }
      case Direction.Down: {
        return getNext(lift, liftRequests, d, lt, Direction.Up, forwardSort);
      }
    }
  };

const getSome = <T>(opt1: Option<T>, opt2: Option<T>): Option<T> => {
  return !(opt1.isEmpty())? opt1: opt2;
}

const getFirstSome = <T>(l: Option<T>[]): Option<T> => l.reduce(getSome, new None);

const oppositeDirection = (d: Direction) : Direction => {
  if (d === Direction.Up)
    return Direction.Down;
  return Direction.Up;
}

const getLiftMoveStrategy = (state: SystemState): Floor => {
  const lift: Lift = state.lift;
  const liftRequests: LiftRequests = state.liftRequests;
  const moveDirection: Option<Direction> = state.direction;

  const nextDirectionalFloor: Option<Floor> = 
    moveDirection.flatMap(d => getNextFloorInDirection(lift, liftRequests, d));

  const nextDirectionGoingOppositeFloor: Option<Floor> =
    moveDirection.flatMap(d => getNextFloorInDirectionRequestedOpposite(lift, liftRequests, d));

  const nextOppositeDirectionalFloor: Option<Floor> = 
    moveDirection
    .map(d => oppositeDirection(d))
    .flatMap(d => getNextFloorInDirection(lift, liftRequests, d));

  const oldestLiftRequestsFloorRequest: Option<Floor> =
    firstInList(state.liftRequests.sort(r => r.timeEpoch).map(r => r.onFloor));
  const nextLiftRequestFloor: Option<Floor> = 
    firstInList(state.lift.floorRequests.map(r => r.floor));

  return getFirstSome(
    [
      nextDirectionalFloor, 
      nextDirectionGoingOppositeFloor,
      nextOppositeDirectionalFloor,
      oldestLiftRequestsFloorRequest, 
      nextLiftRequestFloor
    ])
    .getOrElse(lift.floor);
}


export {SystemState, firstInList, getNextFloorInDirection, getSome, getFirstSome, getLiftMoveStrategy, getNextFloorRequest, gt, lt, forwardSort, reverseSort};
