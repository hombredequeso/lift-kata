import { Option, None, Some} from 'tsoption'
import {Direction, 
  LiftRequests, Lift, FloorRequestButtonPressedEvent} from './lift.functional'

import {SystemState, getSome, getFirstSome, getLiftMoveStrategy} from './lift.functional.algorithm2';

test('getSome returns first something', () => {
  const o1: Some<number> = Option.of<number>(1);
  expect(getSome<number>(o1, Option.of(2))).toEqual(Option.of(1));
  expect(getSome<number>(Option.of<number>(1), new None)).toEqual(Option.of(1));
  expect(getSome<number>(new None<number>(), Option.of(2))).toEqual(Option.of(2));
  expect(getSome<number>(new None<number>(), new None)).toEqual(new None);
});


test('getFirstSome returns first some from the list', () => {
  expect(getFirstSome<number>([])).toEqual(new None);
  expect(getFirstSome<number>([new None])).toEqual(new None);
  expect(getFirstSome<number>([Option.of(1)])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), Option.of(2)])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), new None])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), new None, Option.of(2)])).toEqual(Option.of(1));
});


test('getLiftMoveStrategy returns expected result: basic test', () => {
  const requestEvent: FloorRequestButtonPressedEvent = {floor: 4}
  const lift: Lift = {
    floor: 1,
    availableFloors: [1,2,3,4],
    floorRequests: [requestEvent]
  };
  const liftRequests: LiftRequests = [
      {
        onFloor: 1,
        direction: Direction.Up,
        timeEpoch: 10
      },
      {
        onFloor: 5,
        direction: Direction.Up,
        timeEpoch: 20
      },
      {
        onFloor: 3,
        direction: Direction.Up,
        timeEpoch: 30
      },
      {
        onFloor: 4,
        direction: Direction.Up,
        timeEpoch: 40
      }
    ];

  const optionUp: Option<Direction> =Option.of<Direction>(Direction.Up);
  const startState: SystemState = {
      lift: lift, 
      direction: optionUp,
      liftRequests: liftRequests,
  };

  const result = getLiftMoveStrategy(startState);
  expect(result).toBe(3);
})


test('getLiftMoveStrategy preferences current lift direction', () => {
  const lift: Lift = {
    floor: 2,
    availableFloors: [1,2,3,4,5,6,7,8,9,10],
    floorRequests: []
  };

  const directionUp: Option<Direction> = Option.of<Direction>(Direction.Up);

  const liftRequests: LiftRequests = [
      {
        onFloor: 3,
        direction: Direction.Down,
        timeEpoch: 10
      },
      {
        onFloor: 4,
        direction: Direction.Up,
        timeEpoch: 20
      }
    ];

  const startState: SystemState = {
      lift: lift, 
      direction: directionUp,
      liftRequests: liftRequests,
  };

  const result = getLiftMoveStrategy(startState);
  expect(result).toBe(4);
})


test('getLiftMoveStrategy searches for floor in lift direction, then opposite direction', () => {
  const lift: Lift = {
    floor: 9,
    availableFloors: [1,2,3,4,5,6,7,8,9,10],
    floorRequests: []
  };
  const liftRequests: LiftRequests = [
      {
        onFloor: 8,
        direction: Direction.Up,
        timeEpoch: 10
      },
      {
        onFloor: 7,
        direction: Direction.Down,
        timeEpoch: 20
      }
    ];

  const optionUp: Option<Direction> = Option.of<Direction>(Direction.Up);
  const startState: SystemState = {
      lift: lift, 
      direction: optionUp,
      liftRequests: liftRequests,
  };

  const result = getLiftMoveStrategy(startState);
  expect(result).toBe(7);
})


test('getLiftMoveStrategy searches for floor in lift direction going in same direction, then opposite direction', () => {
  const lift: Lift = {
    floor: 5,
    availableFloors: [1,2,3,4,5,6,7,8,9,10],
    floorRequests: []
  };

  const optionUp: Option<Direction> = Option.of<Direction>(Direction.Up);

  const liftRequests: LiftRequests = [
      {
        onFloor: 7,
        direction: Direction.Down,
        timeEpoch: 10
      },
      {
        onFloor: 8,
        direction: Direction.Down,
        timeEpoch: 100
      },
      {
        onFloor: 4,
        direction: Direction.Up,
        timeEpoch: 5
      },
      {
        onFloor: 3,
        direction: Direction.Down,
        timeEpoch: 1
      }
    ];

  const startState: SystemState = {
      lift: lift, 
      direction: optionUp,
      liftRequests: liftRequests,
  };

  const result = getLiftMoveStrategy(startState);
  expect(result).toBe(8);
})
