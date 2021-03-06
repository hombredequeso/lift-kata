import { Option, None, Some} from 'tsoption'
import {Direction, 
  LiftRequests, Lift, Floor, FloorRequestButtonPressedEvent
} from './lift.functional'

import {
  SystemState, getSome, getFirstSome, 
  getLiftMoveStrategy, getNextFloorRequest,
  gt, lt, forwardSort, reverseSort
} from './lift.functional.algorithm2';

test('getSome returns first something', () => {
  const o1: Some<number> = Option.of<number>(1);
  expect(getSome<number>(o1, Option.of(2))).toEqual(Option.of(1));
  expect(getSome<number>(Option.of<number>(1), new None)).toEqual(Option.of(1));
  expect(getSome<number>(new None<number>(), Option.of(2))).toEqual(Option.of(2));
  expect(getSome<number>(new None<number>(), new None)).toEqual(new None);
});

test('sort order', () => {
  expect([3,7,1].sort(forwardSort)).toEqual([1,3,7])
  expect([3,7,1].sort(reverseSort)).toEqual([7,3,1])
});

test('gt and lt', () => {
  expect([1,2,3,4].filter(x => gt(x, 3))).toEqual([4])

});

test('getFirstSome returns first some from the list', () => {
  expect(getFirstSome<number>([])).toEqual(new None);
  expect(getFirstSome<number>([new None])).toEqual(new None);
  expect(getFirstSome<number>([Option.of(1)])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), Option.of(2)])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), new None])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), new None, Option.of(2)])).toEqual(Option.of(1));
});

const tenFloors: Floor[] = [1,2,3,4,5,6,7,8,9,10]
test.each([
  ['No floor requests returns none', 
    {floor: 5, availableFloors: tenFloors, floorRequests:[]}, Direction.Up, 
    new None()],
  ['No floor requests in direction returns none',
    {floor: 5, availableFloors: tenFloors, floorRequests:[{floor: 2}]}, Direction.Up, 
    new None()],
  ['Got floor request in direction returns that floor',
    {floor: 5, availableFloors: tenFloors, floorRequests:[{floor: 6}]}, Direction.Up, 
    Option.of<Floor>(6)],
  ['Got multiple floor request in up direction returns first available floor',
    {floor: 5, availableFloors: tenFloors, floorRequests:[{floor: 7},{floor: 6}]}, Direction.Up, Option.of<Floor>(6)],
  ['Got floor request in down direction returns that floor, ',
    {floor: 5, availableFloors: tenFloors, floorRequests:[{floor: 3}]}, Direction.Down, 
    Option.of<Floor>(3)]
])('getNextFloorRequest floor: %p', (s, lift, direction, expectedFloor) => {
  expect(getNextFloorRequest(lift, direction)).toEqual(expectedFloor);
});

test('getLiftMoveStrategy returns expected result: basic test', () => {
  const requestEvent: FloorRequestButtonPressedEvent = {floor: 4}
  const lift: Lift = {
    floor: 1,
    availableFloors: [1,2,3,4],
    floorRequests: []
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
