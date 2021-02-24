import {start as promptStart, get as promptGet, Schema} from 'prompt';
import {SystemState, FloorRequestButtonPressedEvent, LiftRequestButtonPressedEvent, LiftArrivedEvent,
  applyFloorRequestEvent, applyLiftRequestEvent, applyLiftArrivedEvent, Direction} 
  from './lift.functional';

console.log("hello world");

const getStr = <T>(a: string | T): string => {
  if (typeof a === "string") {
    return a;
  } else {
    throw 'Invalid Input';
  }
}

const toNumber = (a: string): number => {
  const result = parseInt(a);
  if (isNaN(result)) {
    throw 'Not an integer'
  } else {
    return result;
  }
}

// const split = (a: string): string[] => a.split(/[/t ]+/);

// const liftData = promptGet(['validFloors', 'currentFloor'])
//   .then(function(result){
//     const floor: string = getStr(result.currentFloor);
//     const floors = getStr(result.validFloors);
//     return {
//        floor: toNumber(floor),
//        availableFloors: split(floors).map(s => toNumber(s)),
//        floorRequests: []
//     };
//   });

const getFloorSchema : Schema= {
  properties: {
    floor: {
      message: "floor number"
    }
  }
}

const getFloorRequest = (): Promise<FloorRequestButtonPressedEvent> => {
  return promptGet([getFloorSchema])
    .then(function(result) {
      return {
        floor: toNumber(getStr(result.floor))
      };
    });
}

const getLiftArrivedEvent = (): Promise<LiftArrivedEvent> => {
  return promptGet([getFloorSchema])
    .then(function(result) {
      return {
        floor: toNumber(getStr(result.floor))
      };
    });
}

const getDirectionSchema : Schema= {
  properties: {
    direction: {
      message: "direction, 0 = up, 1 = down"
    }
  }
}

const getLiftRequest = (): Promise<LiftRequestButtonPressedEvent> => {
  return promptGet([getFloorSchema, getDirectionSchema])
    .then(function(result){
      return {
        onFloor: toNumber(getStr(result.floor)),
        direction: toNumber(getStr(result.direction)),
        timeEpoch: Math.round(Date.now() / 1000)
      }
    });
}

const getEventTypeSchema : Schema = {
  properties: {
    eventNumber: {
      message: "event selection; 1=floor request, 2=lift request, 3=lift arrived"
    }
  }
}
const getEventType = (): Promise<number> => {
  return promptGet([getEventTypeSchema])
    .then(function(result) {
      return toNumber(getStr(result.eventNumber));
    });
}

const getEvent = (i: number) : Promise<[string, FloorRequestButtonPressedEvent| LiftRequestButtonPressedEvent | LiftArrivedEvent]> => {
  switch(i) {
    case 1: {
      return getFloorRequest().then(function(x){return ["FloorRequestButtonPressedEvent",x]});
    }
    case 2: {
      return getLiftRequest().then(function(x){return ["LiftRequestButtonPressedEvent",x]});
    }
    case 3: {
      return getLiftArrivedEvent().then(function(x){return ["LiftArrivedEvent",x]});
    }
    default: {
      return getFloorRequest().then(function(x){return ["FloorRequestButtonPressedEvent",x]});
    }
  }
}

// const getEventInstanceName = (e: FloorRequestButtonPressedEvent | LiftRequestButtonPressedEvent) => {
//   if ((e as LiftRequestButtonPressedEvent).direction !== undefined)
//     return "LiftRequestButtonPressedEvent";
//   return "FloorRequestButtonPressedEvent";

// }

const applyEvent = (s: SystemState, evtType: string,  e: FloorRequestButtonPressedEvent | LiftRequestButtonPressedEvent | LiftArrivedEvent): SystemState => {
  switch(evtType) {
    case "FloorRequestButtonPressedEvent": {
      return applyFloorRequestEvent(s, e as FloorRequestButtonPressedEvent);
    }
    case "LiftRequestButtonPressedEvent": {
      return applyLiftRequestEvent(s, e as LiftRequestButtonPressedEvent)
    }
    case "LiftArrivedEvent": {
      return applyLiftArrivedEvent(s, e as LiftArrivedEvent)
    }
    default: {
      throw "Invalid Type exception";
    }
  }

}

// getNextState: here is the top level sequence, that takes the current systemState
// determines what is going to happen (gets an event), applies the event to the
// current state, and returns the new state.
// Most importantly, this function does not mutate the 'systemState' parameter
// but rather returns an entire new copy of the SystemState.
const getNextState = (systemState: SystemState): Promise<SystemState> => {
  return getEventType()
    .then(function(eventNumber) { 
      // Note that, getEvent isn't functional because it accepts user
      // input and also gets the current time.
      return getEvent(eventNumber);
    })
    .then(function([eventType, evt]) {
      // applyEvent is completely functional, and it is where all the
      // important lift business logic lives.
      return applyEvent(systemState, eventType, evt);
    });
}



const initialState: SystemState = {
  lift: 
    {
      floor: 1,
      availableFloors: [1,2,3,4,5,6,7,8,9,10],
      floorRequests: []
    },
  liftRequests: []
};

promptStart({message:">>"});

// Here's the main loop
// i + currentState together are the mutable state. They are updated after getNextState is called.
let i = 0;
let currentState = initialState;
(function loop (): any {
  const strState = JSON.stringify(currentState, null, 2);
  console.log({i});
  console.log(strState);
  // But the important bit is that getNextState will not change currentState.
  return getNextState(currentState).then((x) => {currentState = x; ++i; process.nextTick(loop)})
})()

// Main loop idea a version of this:
// https://github.com/nodejs/node/issues/6673#issuecomment-218200439

