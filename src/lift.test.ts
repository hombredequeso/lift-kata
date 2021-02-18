import { Option, None, Some } from 'tsoption'


type Floor = number;
type EpochTime = number;

enum Direction {Up,  Down};

// Events:

interface LiftRequestButtonPressedEvent {
  onFloor: Floor,
  direction: Direction,
  timeEpoch: EpochTime
};

interface FloorRequestButtonPressedEvent {
  floor: Floor;
};

interface LiftArrivalEvent {
  floor: Floor
}

// System State: 

interface Lift {
  floor: Floor,
  availableFloors: [Floor],
  floorRequests: [FloorRequestButtonPressedEvent]
}

interface LiftController {
  liftRequests: [LiftRequestButtonPressedEvent]
}

// The Rest...
test('Can create a valid lift', () => {
  const lift = {
    floor: 0,
    availableFloors: [0,1,2,3],
    floorRequests: []
  };
  expect(lift.floor).toBe(0);
});


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

test('LiftArrivedAtEvent returns new controller state, empty state', () => {
  const initialState: LiftController = {
    liftRequests : []
  };
  const event: LiftArrivalEvent = {
    floor: 0
  };

  const newState: LiftController = 
    processLiftArrivalEventForController(initialState, event);

  expect(newState).toEqual({
    liftRequests : []
  });
  expect(initialState).toEqual({liftRequests:[]})
})

test('LiftArrivedAtEvent returns new controller state, removing all floor events', () => {
  const initialState: LiftController = {
    liftRequests : [{
      onFloor: 0,
      direction: Direction.Up,
      timeEpoch: 123
    }, {
      onFloor: 1,
      direction: Direction.Up,
      timeEpoch: 999
    }]
  };

  const event: LiftArrivalEvent = {
    floor: 1,
  };

  const newState: LiftController = 
    processLiftArrivalEventForController(initialState, event);

  expect(newState).toEqual({
    liftRequests : [{
      onFloor: 0,
      direction: Direction.Up,
      timeEpoch: 123
    }]
  });
})

const processLiftArrivalEventForController = (
  controller: LiftController, 
  event: LiftArrivedAtEvent)
  : LiftController => {
    return {
      liftRequests : controller.liftRequests.filter(x => x.onFloor !== event.floor)
    };
  };

const processLiftRequestEvent = (
  controller: LiftController, 
  event: LiftRequestButtonPressedEvent)
  : LiftController => {
    return {
      liftRequests: [...controller.liftRequests, event]
    };
  };

test('processLiftRequestEvent returns new controller state', () => {
  const initialState: LiftController = {
    liftRequests : [],
  };
  const buttonPress: LiftRequestButtonPressedEvent = {
    onFloor: 0,
    direction: Direction.Up,
    timeEpoch: 999
  };
  const newState: LiftController = 
    processLiftRequestEvent(initialState, buttonPress);

  expect(newState).toEqual({
    liftRequests : [buttonPress],
  });
  expect(initialState).toEqual({liftRequests:[]})
})


interface SystemState {
  lift: Lift,
    controller: LiftController
};


const getLiftMoveStrategy1 = (state: SystemState): Floor => {
  const orderedRequests = 
    state
    .controller
    .liftRequests
    .filter(r => r.onFloor !== state.lift.floor)
    .filter(r => state.lift.availableFloors.includes(r.onFloor))
    .sort(r => r.timeEpoch);
  return (orderedRequests.length > 0)?  
    orderedRequests[0].onFloor :
    lift.floor;
}

test('getLiftMove returns oldest request of floor lift is not at', () => {
  const lift: Lift = {
    floor: 1,
    availableFloors: [1,2,3,4]
  };

  const controller = {
    liftRequests: [
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
    ]
  };

  const result = getLiftMoveStrategy1(
    {
      lift: lift, 
      controller: controller
    });

  expect(result).toBe(3);
})



const applyMoveEvent = (
  state: SystemState, 
  moveEvent: LiftArrivalEvent)
  : SystemState => {
    return {
      lift: processLiftArrivalEventForLift(state.lift, moveEvent),
      controller: processLiftArrivalEventForController(state.controller, moveEvent)
    };
  };

const applyFloorRequestEvent = (
  state: SystemState, 
  event: FloorRequestButtonPressedEvent)
  : SystemState => {
    return {
      lift: processFloorRequestEventForLift(state.lift, event).getOrElse(lift),
      controller: state.controller
    };
  };

test('Test run full sequence', () => {
  const initialState: SystemState = {
    lift: {
      floor: 10,
      availableFloors: [1,2,3,4,5,9,10, 11, 12, 13, 20],
      floorRequests: []
    },
    controller: {
      liftRequests: [
        {
          onFloor: 4,
          direction: Direction.Up,
          timeEpoch: 5
        }
      ]
    }
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
    controller: {
      liftRequests: [
      ]
    }
  };
});

// Part 3:
interface MoveStrategy{
  direction: Option<Direction>
}

interface SystemState2 {
  lift: Lift,
    controller: LiftController,
    moveStrategy: MoveStrategy
};

const firstInList = (l: [T]) : Option<T> => {
  return (l.length)? 
    Option.of(l[0])
    : new None;
}

const getNextFloorInDirection = 
  (lift: Lift, 
    controller: LiftController, 
    d: Direction)
  : Option<Floor> => {
    switch (d) {
      case Direction.Up: {
        const requestedFloorsAbove = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(controller.liftRequests.map(r => r.onFloor))
          .filter(f => f > lift.floor)
          .sort();
        return firstInList(requestedFloorsAbove)
      }
      case Direction.Down: {
        const requestedFloorsBelow = 
          lift
          .floorRequests
          .map(r => r.floor)
          .concat(controller.liftRequests.map(r => r.onFloor))
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
  const controller: LiftController = state.controller;
  const moveDirection: Option<Direction> = state.moveStrategy.direction;

  const nextDirectionalFloor: Option<Floor> = 
    moveDirection.flatMap(d => getNextFloorInDirection(lift, controller, d));
  const oldestControllerFloorRequest: Option<Floor> =
    firstInList(state.controller.liftRequests.sort(r => r.timeEpoch).map(r => r.onFloor));
  const nextLiftRequestFloor: Option<Floor> = 
    firstInList(state.lift.floorRequests.map(r => r.floor));

  return getFirstSome(
    [
      nextDirectionalFloor, 
      oldestControllerFloorRequest, 
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
  const controller = {
    liftRequests: [
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
    ]
  };

  const moveStrategy = {
    direction: Option.of(Direction.Up)
  };

  const result = getLiftMoveStrategy2(
    {
      lift: lift, 
      controller: controller,
      moveStrategy: moveStrategy
    });

  expect(result).toBe(3);
})

