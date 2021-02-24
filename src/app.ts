import {start as promptStart, get as promptGet } from 'prompt';
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

promptStart();
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

const getFloorRequest = (): Promise<FloorRequestButtonPressedEvent> => {
  return promptGet(['floor'])
    .then(function(result) {
      return {
        floor: toNumber(getStr(result.floor))
      };
    });
}

const getLiftArrivedEvent = (): Promise<LiftArrivedEvent> => {
  return promptGet(['floor'])
    .then(function(result) {
      return {
        floor: toNumber(getStr(result.floor))
      };
    });
}

const getLiftRequest = (): Promise<LiftRequestButtonPressedEvent> => {
  return promptGet(['floor', 'direction'])
    .then(function(result){
      return {
      onFloor: toNumber(getStr(result.floor)),
      direction: toNumber(getStr(result.direction)),
      timeEpoch: Math.round(Date.now() / 1000)
    }
    });
  // return Promise.resolve({
  //   onFloor: 7,
  //   direction: Direction.Up,
  //   timeEpoch: 1234
  // });
}

const getEventType = (): Promise<number> => {
  return promptGet(['eventNumber'])
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

const eventLoop = (systemState: SystemState): Promise<SystemState> => {
  return getEventType()
    .then(function(eventNumber) { 
      return getEvent(eventNumber);
    })
    .then(function([eventType, evt]) {
      return applyEvent(systemState, eventType, evt);
    });
}



// const increment = (i: number): Promise<number> => {
//   console.log({i});
//   return Promise.resolve(i + 1);
// }

const initialState: SystemState = {
  lift: 
    {
      floor: 1,
      availableFloors: [1,2,3,4,5,6,7,8,9,10],
      floorRequests: []
    },
  liftRequests: []
};

let i = 0;
let currentState = initialState;
(function loop (): any {
  const strState = JSON.stringify(currentState);
  console.log({i, strState});
  return eventLoop(currentState).then((x) => {currentState = x; ++i; process.nextTick(loop)})
})()
console.log("goodbye world");

// var i = 0;
// ;(function loop (): any {

//   if (i > 100000) {
//     console.log("ending program");
//     process.exit();
//   }

//   if (i % 100000 === 0) {
//     return increment(i).then((x) => {i = x; process.nextTick(loop)})
//   }

//   // return increment(i).then(loop);
//   return increment(i).then(function(x) {i=x;}).then(loop);
// })()


// await program();
