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


test('getLiftMoveStrategy returns expected result', () => {
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

