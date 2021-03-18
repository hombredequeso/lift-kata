import { Option, None, Some} from 'tsoption'
import {
  LiftRequests, Lift
} from './lift.functional'
import {
  Direction, Floor, FloorRequestButtonPressedEvent
} from './events'

import {
  SystemState, getLiftMoveStrategy,getMatchInListsFromBoundary
} from './lift.functional.algorithm3';

test('getMatchInListsFromBoundary', () => {
  expect(
    getMatchInListsFromBoundary(
      [1,2,3,4,5], 
      [1,2,3,4,5], 
      3, 
      (a,b)=>a>b, 
      (a,b)=>a-b)
  ).toEqual(
    Option.of<number>(4));

  expect(
    getMatchInListsFromBoundary(
      [1,2,3,4,5], 
      [1,2,3,4,5], 
      3, 
      (a,b)=>a<b, 
      (a,b)=>a-b)
  ).toEqual(
    Option.of<number>(1));


  expect(
    getMatchInListsFromBoundary(
      [1,2,3,4,5], 
      [1,2,3,4,5], 
      3, 
      (a,b)=>a>b, 
      (a,b)=>b-a)
  ).toEqual(
    Option.of<number>(5));

  expect(
    getMatchInListsFromBoundary(
      [1,2,3,4,5], 
      [1,2,3,4,5], 
      3, 
      (a,b)=>a<b, 
      (a,b)=>b-a)
  ).toEqual(
    Option.of<number>(2));


  expect(
    getMatchInListsFromBoundary(
      [1,2,3], 
      [1,2,3], 
      3, 
      (a,b)=>a>b, 
      (a,b)=>a-b)
  ).toEqual(
    new None());

  expect(
    getMatchInListsFromBoundary(
      [3,4,5], 
      [3,4,5], 
      3, 
      (a,b)=>a<b, 
      (a,b)=>a-b)
  ).toEqual(
    new None());

})

test('getLiftMoveStrategy, request up', () => {
  const state = {
    lift: {
      floor: 3,
        availableFloors: [1,2,3,4,5],
        floorRequests: []
    },
    direction: Direction.Up,
    liftRequests: [
      {
        onFloor: 4,
          direction: Direction.Up,
          timeEpoch: 10
      }
    ]
  };
  expect(getLiftMoveStrategy(state)).toEqual(Some.of(4))
})

test('getLiftMoveStrategy, floor up', () => {
  const state = {
    lift: {
      floor: 3,
        availableFloors: [1,2,3,4,5,6],
        floorRequests: [{floor: 5}]
    },
    direction: Direction.Up,
    liftRequests: [
    ]
  };
  expect(getLiftMoveStrategy(state)).toEqual(Some.of(5))
})


test('getLiftMoveStrategy, request down', () => {
  const state = {
    lift: {
      floor: 3,
        availableFloors: [1,2,3,4,5],
        floorRequests: []
    },
    direction: Direction.Up,
    liftRequests: [
      {
        onFloor: 4,
          direction: Direction.Down,
          timeEpoch: 10
      },
      {
        onFloor: 5,
          direction: Direction.Down,
          timeEpoch: 10
      }
    ]
  };
  expect(getLiftMoveStrategy(state)).toEqual(Some.of(5));
})

test('getLiftMoveStrategy, lift request down below', () => {
  const state = {
    lift: {
      floor: 4,
        availableFloors: [1,2,3,4,5],
        floorRequests: []
    },
    direction: Direction.Up,
    liftRequests: [
      {
        onFloor: 2,
          direction: Direction.Down,
          timeEpoch: 10
      },
      {
        onFloor: 3,
          direction: Direction.Down,
          timeEpoch: 10
      }
    ]
  };
  expect(getLiftMoveStrategy(state)).toEqual(Some.of(3));
})


test('getLiftMoveStrategy, floor request below', () => {
  const state = {
    lift: {
      floor: 4,
        availableFloors: [1,2,3,4,5],
        floorRequests: [{floor:2}, {floor:3}]
    },
    direction: Direction.Up,
    liftRequests: [
    ]
  };
  expect(getLiftMoveStrategy(state)).toEqual(Some.of(3));
})

test('getLiftMoveStrategy, lift request up below', () => {
  const state = {
    lift: {
      floor: 4,
        availableFloors: [1,2,3,4,5],
        floorRequests: []
    },
    direction: Direction.Up,
    liftRequests: [
      {
        onFloor: 2,
          direction: Direction.Up,
          timeEpoch: 10
      },
      {
        onFloor: 3,
          direction: Direction.Up,
          timeEpoch: 10
      }
    ]
  };
  expect(getLiftMoveStrategy(state)).toEqual(Some.of(2));
})

test('getLiftMoveStrategy, mixed #1', () => {
  const state = {
    lift: {
      floor: 5,
        availableFloors: [1,2,3,4,5,11,12,13,14,15],
        // floor 6: not available
        floorRequests: [{floor: 6},{floor: 12}]
    },
    direction: Direction.Up,
    liftRequests: [
      {
        onFloor: 7, // floor not available
          direction: Direction.Down,
          timeEpoch: 10
      },
      {
        onFloor: 8, // floor not available
          direction: Direction.Up,
          timeEpoch: 10
      },
      {
        onFloor: 11,  // Not going in right direction
          direction: Direction.Down,
          timeEpoch: 10
      },
      {
        onFloor: 13,
          direction: Direction.Up,
          timeEpoch: 10
      }
    ]
  };
  expect(getLiftMoveStrategy(state)).toEqual(Some.of(12));

})

