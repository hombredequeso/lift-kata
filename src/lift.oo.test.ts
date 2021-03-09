
import {
  Lift, LiftRequests
} from './lift.oo'

import {
  Direction, Floor
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivedEvent
} from './events'


test('LiftRequests constructor correctly creates object', () => {
  const liftRequests = new LiftRequests();
  expect(liftRequests.requests).toEqual([]);
})

test('addRequest adds a request', () => {
  const liftRequests = new LiftRequests();
  const request = {
    onFloor: 1
    direction: Direction.Up,
    timeEpoch: 10
  };
  liftRequests.addRequest(request);

  expect(liftRequests.requests).toEqual([
    request
  ]);
});

test('Lift constructor correctly creates object', () => {
  const floor = 1;
  const availableFloors = [1,2,3,4,5,6];
  const lift = new Lift(floor, availableFloors);

  expect(lift.floor).toEqual(floor);
  expect(lift.availableFloors);
});

test('moveTo available floor updates floor and clears floorRequests for the floor', () => {

  const floor = 1;
  const availableFloors = [1,2,3,4,5,6];
  const lift = new Lift(floor, availableFloors);
  lift.addRequest(
    {
      onFloor: 2
      direction: Direction.Up,
      timeEpoch: 10
    });
  lift.addRequest(
    {
      onFloor: 3
      direction: Direction.Up,
      timeEpoch: 10
    });

  lift.moveTo(3);

  expect(lift.floor).toEqual(3);
  expect(lift.floorRequests).toEqual([
    {
      onFloor: 2
      direction: Direction.Up,
      timeEpoch: 10
    }
  ])
})

test('moveTo unavailable floor does nothing', () => {
  const floor = 1;
  const availableFloors = [1,2,3,4,5,6];
  const lift = new Lift(floor, availableFloors);
  lift.addRequest(
    {
      onFloor: 2
      direction: Direction.Up,
      timeEpoch: 10
    });
  lift.addRequest(
    {
      onFloor: 3
      direction: Direction.Up,
      timeEpoch: 10
    });

  lift.moveTo(7);

  expect(lift.floor).toEqual(floor);
  expect(lift.floorRequests).toEqual([
    {
      onFloor: 2
      direction: Direction.Up,
      timeEpoch: 10
    },
    {
      onFloor: 3
      direction: Direction.Up,
      timeEpoch: 10
    }
  ])
}
});
