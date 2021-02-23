import { Option, None, Some } from 'tsoption'
import {Direction, Floor, EpochTime, 
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivalEvent} from './lift.functional'

// type Floor = number;
// type EpochTime = number;

// enum Direction {Up,  Down};

// Events:


// System State: 

type LiftRequests =  [LiftRequestButtonPressedEvent]

interface Lift {
  floor: Floor,
  availableFloors: [Floor],
  floorRequests: [FloorRequestButtonPressedEvent]
}

// The Rest...

const processFloorRequestEventForLift = (
  lift: Lift,
  event: FloorRequestButtonPressedEvent
): Option<Lift> => {
  return (lift.availableFloors.includes(event.floor))? 
    Option.of({
      floor: lift.floor,
      availableFloors: lift.availableFloors,
      floorRequests: [...lift.floorRequests, event]
    }):
    new None;
};

const processLiftArrivalEventForLift = (
  lift: Lift, 
  event: LiftArrivedAtEvent)
  : Lift=> {
    return {
      floor: event.floor,
      availableFloors: lift.availableFloors,
      floorRequests: lift.floorRequests.filter(r => r.floor !== event.floor)
    };
  }

const processLiftArrivalEventForLiftRequests = (
  requests: LiftRequests, 
  event: LiftArrivedAtEvent)
  : LiftRequests => {
    return requests.filter(x => x.onFloor !== event.floor);
  };

const listAppend = (ts: [T], t: T): [T] => [...ts, t];
const processLiftRequestEvent = listAppend;

interface SystemState {
  lift: Lift,
  liftRequests: LiftRequests
};

const getLiftMoveStrategy1 = (state: SystemState): Floor => {
  const orderedRequests = 
    state
    .liftRequests
    .filter(r => r.onFloor !== state.lift.floor)
    .filter(r => state.lift.availableFloors.includes(r.onFloor))
    .sort(r => r.timeEpoch);
  return (orderedRequests.length > 0)?  
    orderedRequests[0].onFloor :
    lift.floor;
}

const applyMoveEvent = (
  state: SystemState, 
  moveEvent: LiftArrivalEvent)
  : SystemState => {
    return {
      lift: processLiftArrivalEventForLift(state.lift, moveEvent),
      liftRequests: processLiftArrivalEventForLiftRequests(state.liftRequests, moveEvent)
    };
  };

const applyFloorRequestEvent = (
  state: SystemState, 
  event: FloorRequestButtonPressedEvent)
  : SystemState => {
    return {
      lift: processFloorRequestEventForLift(state.lift, event).getOrElse(lift),
      liftRequests: state.liftRequests
    };
  };


test('Can create a valid lift', () => {
  const lift = {
    floor: 0,
    availableFloors: [0,1,2,3],
    floorRequests: []
  };
  expect(lift.floor).toBe(0);
});

test('LiftArrivalEvent returns new lift state', () => {
  const initialLift: Lift= {
    floor: 1,
    availableFloors: [1,2,3],
    floorRequests: [{floor: 2}, {floor: 3}]
  };

  const event: LiftArrivalEvent = {
    floor: 2
  };

  const newLift: Lift = processLiftArrivalEventForLift(initialLift, event);

  expect(newLift).toEqual({
    floor: 2,
    availableFloors: [1,2,3],
    floorRequests: [{floor: 3}]
  });
})

test('LiftArrivedAtEvent returns new LiftRequests state, empty state', () => {
  const initialState: LiftRequests = 
    []
  
  const event: LiftArrivalEvent = {
    floor: 0
  };

  const newState: LiftRequests = processLiftArrivalEventForLiftRequests(initialState, event);

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

  const event: LiftArrivalEvent = {
    floor: 1,
  };

  const newState: LiftRequests = 
    processLiftArrivalEventForLiftRequests(initialState, event);

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
    availableFloors: [1,2,3,4]
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



test('Test run full sequence', () => {
  const initialState: SystemState = {
    lift: {
      floor: 10,
      availableFloors: [1,2,3,4,5,9,10, 11, 12, 13, 20],
      floorRequests: []
    },
    liftRequests: 
       [
        {
          onFloor: 4,
          direction: Direction.Up,
          timeEpoch: 5
        }
      ]
  };

  const nextFloor = getLiftMoveStrategy1(initialState);
  const moveEvent: LiftArrivalEvent = {floor: nextFloor};
  const newState = applyMoveEvent(initialState, moveEvent);
  // const floorRequestEvent: FloorRequestButtonPressedEvent = RandomlyGetOne(...)
  // const newState2 = applyFloorRequestEvent(newState, floorRequestEvent);

  const expectedState: SystemState = {
    lift: {
      floor: 4,
      availableFloors: [1,2,3,4,5,9,10, 11, 12, 13, 20],
      floorRequests: []
    },
    liftRequests: {
      liftRequests: [
      ]
    }
  };
});


// Part 3:
interface SystemState2 {
  lift: Lift,
  direction: Option<Direction>
    liftRequests: LiftRequests,
};

const firstInList = (l: [T]) : Option<T> => {
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
    };
  };

const getSome = (opt1: Option<T>, opt2: Option<T>): Option<T> => {
  return !(opt1.isEmpty())? opt1: opt2;
}

test('getSome returns first something', () => {
  expect(getSome(Option.of(1), Option.of(2))).toEqual(Option.of(1));
  expect(getSome(Option.of(1), new None)).toEqual(Option.of(1));
  expect(getSome(new None, Option.of(2))).toEqual(Option.of(2));
  expect(getSome(new None, new None)).toEqual(new None);
});

const getFirstSome = (l: [Option<T>]): Option<T> => l.reduce(getSome, new None);

test('getFirstSome returns first some from the list', () => {
  expect(getFirstSome([])).toEqual(new None);
  expect(getFirstSome([new None])).toEqual(new None);
  expect(getFirstSome([Option.of(1)])).toEqual(Option.of(1));
  expect(getFirstSome([Option.of(1), Option.of(2)])).toEqual(Option.of(1));
  expect(getFirstSome([Option.of(1), new None])).toEqual(Option.of(1));
  expect(getFirstSome([Option.of(1), new None, Option.of(2)])).toEqual(Option.of(1));
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
    .getOrElse(lift.Floor);
}


test('getLiftMoveStrategy2 returns expected result', () => {
  const lift: Lift = {
    floor: 1,
    availableFloors: [1,2,3,4],
    floorRequests: [4]
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

  const result = getLiftMoveStrategy2(
    {
      lift: lift, 
      direction: Option.of(Direction.Up),
      liftRequests: liftRequests,
    });

  expect(result).toBe(3);
})

