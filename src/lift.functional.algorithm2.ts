import { Option, None } from 'tsoption'
import { Direction, Floor, /*EpochTime,*/ 
  LiftRequests, Lift } from './lift.functional'


interface SystemState {
  lift: Lift,
  direction: Option<Direction>
    liftRequests: LiftRequests,
}

const firstInList = <T>(l: T[]) : Option<T> => {
  return (l.length)? 
    Option.of(l[0])
    : new None;
}

const getNextFloorInDirection = 
  (lift: Lift, 
    liftRequests: LiftRequests, 
    d: Direction)
  : Option<Floor> => {
    switch (d) {
      case Direction.Up: {
        const requestedFloorsAbove = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(liftRequests.filter(r => r.direction === Direction.Up).map(r => r.onFloor))
          .filter(f => f > lift.floor)
          .sort();
        return firstInList(requestedFloorsAbove)
      }
      case Direction.Down: {
        const requestedFloorsBelow = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(liftRequests.filter(r => r.direction === Direction.Down).map(r => r.onFloor))
          .filter(f => f < lift.floor)
          .sort(f => 0-f);
        return firstInList(requestedFloorsBelow);
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
        const requestedFloorsAbove = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(liftRequests.filter(r => r.direction === Direction.Down).map(r => r.onFloor))
          .filter(f => f > lift.floor)
          .sort(f => 0-f);
        return firstInList(requestedFloorsAbove)
      }
      case Direction.Down: {
        const requestedFloorsBelow = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(liftRequests.filter(r => r.direction === Direction.Up).map(r => r.onFloor))
          .filter(f => f < lift.floor)
          .sort();
        return firstInList(requestedFloorsBelow);
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


export {SystemState, firstInList, getNextFloorInDirection, getSome, getFirstSome, getLiftMoveStrategy};
