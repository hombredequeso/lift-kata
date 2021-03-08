import { Option, None, Some} from 'tsoption'
import {Direction, 
  LiftRequests, Lift, Floor, FloorRequestButtonPressedEvent
} from './lift.functional'

import {
  SystemState, getLiftMoveStrategy,getMatchInListsFromBoundary, listOp
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

test('listMin', () => {
  expect(listOp([], Math.min)).toEqual(new None());
  expect(listOp([1], Math.min)).toEqual(Some.of(1));
  expect(listOp([1,2], Math.min)).toEqual(Some.of(1));
  expect(listOp([2,1], Math.min)).toEqual(Some.of(1));
  expect(listOp([3,7,2,9,6,1,5,8, 9], Math.min)).toEqual(Some.of(1));
})
