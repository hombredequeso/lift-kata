import {start as promptStart, get as promptGet } from 'prompt';
import {SystemState, FloorRequestButtonPressedEvent, 
  applyFloorRequestEvent} 
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

const getEventType = (): Promise<number> => {
  return promptGet(['eventNumber'])
    .then(function(result) {
      return toNumber(getStr(result.eventNumber));
    });
}

const getEvent = (i: number) : Promise<FloorRequestButtonPressedEvent> => {
  switch(i) {
    case 1: {
      return getFloorRequest();
    }
    default: {
      return getFloorRequest();
    }
  }
}

const applyEvent = (s: SystemState, e: FloorRequestButtonPressedEvent) => {
  return applyFloorRequestEvent(s, e);
}

const eventLoop = (systemState: SystemState): Promise<SystemState> => {
  return getEventType()
    .then(function(eventNumber) { 
      return getEvent(eventNumber);
    })
    .then(function(evt) {
      return applyEvent(systemState, evt);
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
