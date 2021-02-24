import { Option, None, Some } from 'tsoption'
import {Direction, Floor, /*EpochTime,*/ 
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivedEvent,
  LiftRequests, Lift,
  processFloorRequestEventForLift, processLiftArrivedEventForLift, processLiftArrivedEventForLiftRequests,
  processLiftRequestEvent, SystemState, getLiftMoveStrategy1, 
  applyLiftArrivedEvent, applyFloorRequestEvent, applyLiftRequestEvent} from './lift.functional'

test('applyLiftRequestEvent updates SystemState correctly', () => {
  const initialState: SystemState = {
    lift: {
      floor: 0,
      availableFloors: [0,1,2,3],
      floorRequests: []
    },
    liftRequests: []
  };
  const event: LiftRequestButtonPressedEvent = {
    onFloor: 1,
    direction: Direction.Up,
    timeEpoch: 999
  };
  const newState = applyLiftRequestEvent(initialState, event);

  expect(newState).toEqual(
    {
      lift: {
        floor: 0,
        availableFloors: [0,1,2,3],
        floorRequests: []
      },
        liftRequests: [event]
      }
  );
});

test('applyFloorRequestEvent updates SystemState correctly', () => {
  const initialState: SystemState = {
    lift: {
      floor: 0,
      availableFloors: [0,1,2,3],
      floorRequests: []
    },
    liftRequests: []
  };

  const event: FloorRequestButtonPressedEvent = {
    floor: 6
  }

  const newState = applyFloorRequestEvent(initialState, event);

  expect(newState).toEqual(
    {
      lift: {
        floor: 0,
        availableFloors: [0,1,2,3],
        floorRequests: []
      },
      liftRequests: []
    }
  );
});

test('applyLiftArrivedEvent updates SystemState', () => {
  const initialState: SystemState = {
    lift: {
      floor: 0,
      availableFloors: [0,1,2,3],
      floorRequests: [{floor: 2}]
    },
    liftRequests: [{
        onFloor: 2,
        direction: Direction.Up,
        timeEpoch: 999
      }]
  };

  const event: LiftArrivedEvent = {
    floor: 2
  }

  const newState = applyLiftArrivedEvent(initialState, event);

  expect(newState).toEqual(
    {
      lift: {
        floor: 2,
        availableFloors: [0,1,2,3],
        floorRequests: []
      },
      liftRequests: []
    }
  );

});

test('processFloorRequestEventForLift adds floor request if lift goes to that floor and return some lift', () => {
  const lift: Lift = {
    floor: 0,
    availableFloors: [0,1,2,3],
    floorRequests: []
  };
  const floorRequest = {
    floor: 2
  };
  const result = processFloorRequestEventForLift(lift, floorRequest);

  expect(result).toEqual(
  Option.of<Lift>({
    floor: 0,
    availableFloors: [0,1,2,3],
    floorRequests: [{floor: 2}]
  }));

});

test('processFloorRequestEventForLift returns None if lift is not available on the floor', () => {
  const lift: Lift = {
    floor: 0,
    availableFloors: [0,1,2,3],
    floorRequests: []
  };
  const floorRequest = {
    floor: 4
  };
  const result = processFloorRequestEventForLift(lift, floorRequest);

  expect(result).toEqual(new None<Lift>());
});
test('Can create a valid lift', () => {
  const lift: Lift = {
    floor: 0,
    availableFloors: [0,1,2,3],
    floorRequests: []
  };
  expect(lift.floor).toBe(0);
});

test('LiftArrivedEvent returns new lift state', () => {
  const initialLift: Lift= {
    floor: 1,
    availableFloors: [1,2,3],
    floorRequests: [{floor: 2}, {floor: 3}]
  };

  const event: LiftArrivedEvent = {
    floor: 2
  };

  const newLift: Lift = processLiftArrivedEventForLift(initialLift, event);

  expect(newLift).toEqual({
    floor: 2,
    availableFloors: [1,2,3],
    floorRequests: [{floor: 3}]
  });
})

test('LiftArrivedAtEvent returns new LiftRequests state, empty state', () => {
  const initialState: LiftRequests = 
    []
  
  const event: LiftArrivedEvent = {
    floor: 0
  };

  const newState: LiftRequests = processLiftArrivedEventForLiftRequests(initialState, event);

  expect(newState).toEqual([]);
  expect(initialState).toEqual([]);
})

test('LiftArrivedAtEvent returns new LiftRequests state, removing all floor events', () => {
  const initialState: LiftRequests = 
    [{
      onFloor: 0,
      direction: Direction.Up,
      timeEpoch: 123
    }, {
      onFloor: 1,
      direction: Direction.Up,
      timeEpoch: 999
    }];

  const event: LiftArrivedEvent = {
    floor: 1,
  };

  const newState: LiftRequests = 
    processLiftArrivedEventForLiftRequests(initialState, event);

  expect(newState).toEqual(
    [{
      onFloor: 0,
      direction: Direction.Up,
      timeEpoch: 123
    }]);
})

test('processLiftRequestEvent returns new LiftRequests state', () => {
  const initialState: LiftRequests = [];
  const buttonPress: LiftRequestButtonPressedEvent = {
    onFloor: 0,
    direction: Direction.Up,
    timeEpoch: 999
  };
  const newState: LiftRequests = 
    processLiftRequestEvent(initialState, buttonPress);

  expect(newState).toEqual([buttonPress]);
  expect(initialState).toEqual([]);
})


test('getLiftMove returns oldest request of floor lift is not at', () => {
  const lift: Lift = {
    floor: 1,
    availableFloors: [1,2,3,4],
    floorRequests: []
  };

  const liftRequests = 
    [
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

  const result = getLiftMoveStrategy1(
    {
      lift: lift, 
      liftRequests: liftRequests
    });

  expect(result).toBe(3);
})


// Part 3:
interface SystemState2 {
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
          .concat(liftRequests.map(r => r.onFloor))
          .filter(f => f > lift.floor)
          .sort();
        return firstInList(requestedFloorsAbove)
      }
      case Direction.Down: {
        const requestedFloorsBelow = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(liftRequests.map(r => r.onFloor))
          .filter(f => f < lift.floor)
          .sort(f => 0-f);
        return firstInList(requestedFloorsBelow);
      }
    }
  };

const getSome = <T>(opt1: Option<T>, opt2: Option<T>): Option<T> => {
  return !(opt1.isEmpty())? opt1: opt2;
}

test('getSome returns first something', () => {
  const o1: Some<number> = Option.of<number>(1);
  expect(getSome<number>(o1, Option.of(2))).toEqual(Option.of(1));
  expect(getSome<number>(Option.of<number>(1), new None)).toEqual(Option.of(1));
  expect(getSome<number>(new None<number>(), Option.of(2))).toEqual(Option.of(2));
  expect(getSome<number>(new None<number>(), new None)).toEqual(new None);
});

const getFirstSome = <T>(l: Option<T>[]): Option<T> => l.reduce(getSome, new None);

test('getFirstSome returns first some from the list', () => {
  expect(getFirstSome<number>([])).toEqual(new None);
  expect(getFirstSome<number>([new None])).toEqual(new None);
  expect(getFirstSome<number>([Option.of(1)])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), Option.of(2)])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), new None])).toEqual(Option.of(1));
  expect(getFirstSome<number>([Option.of(1), new None, Option.of(2)])).toEqual(Option.of(1));
});

const getLiftMoveStrategy2 = (state: SystemState2): Floor => {
  const lift: Lift = state.lift;
  const liftRequests: LiftRequests = state.liftRequests;
  const moveDirection: Option<Direction> = state.direction;

  const nextDirectionalFloor: Option<Floor> = 
    moveDirection.flatMap(d => getNextFloorInDirection(lift, liftRequests, d));
  const oldestLiftRequestsFloorRequest: Option<Floor> =
    firstInList(state.liftRequests.sort(r => r.timeEpoch).map(r => r.onFloor));
  const nextLiftRequestFloor: Option<Floor> = 
    firstInList(state.lift.floorRequests.map(r => r.floor));

  return getFirstSome(
    [
      nextDirectionalFloor, 
      oldestLiftRequestsFloorRequest, 
      nextLiftRequestFloor
    ])
    .getOrElse(lift.floor);
}


test('getLiftMoveStrategy2 returns expected result', () => {
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
  const result = getLiftMoveStrategy2(
    {
      lift: lift, 
      direction: optionUp,
      liftRequests: liftRequests,
    });

  expect(result).toBe(3);
})

