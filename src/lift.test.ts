import { Option, None} from 'tsoption'
import {
  LiftRequests, Lift,
  processFloorRequestEventForLift, processLiftArrivedEventForLift, processLiftArrivedEventForLiftRequests,
  processLiftRequestEvent, SystemState, getLiftMoveStrategy1, 
  applyLiftArrivedEvent, applyFloorRequestEvent, applyLiftRequestEvent} from './lift.functional'
import {
  Direction, Floor, 
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivedEvent
} from './events'


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

test('sets', () => {
  const s = new Set([1,2,3]);
  expect(s.size).toEqual(3);

  

})

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

  const newLift: Option<Lift> = processLiftArrivedEventForLift(initialLift, event);

  expect(newLift).toEqual(Option.of<Lift>({
    floor: 2,
    availableFloors: [1,2,3],
    floorRequests: [{floor: 3}]
  }));
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



