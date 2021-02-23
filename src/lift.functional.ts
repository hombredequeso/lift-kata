import { Option, None, Some } from 'tsoption'

enum Direction {Up,  Down};

type Floor = number;
type EpochTime = number;

const listAppend = <T>(ts: T[], t: T): T[] => [...ts, t];

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

type LiftRequests =  LiftRequestButtonPressedEvent[];

interface Lift {
  floor: Floor,
  availableFloors: Floor[],
  floorRequests: FloorRequestButtonPressedEvent[]
}

const processFloorRequestEventForLift = (
  lift: Lift,
  event: FloorRequestButtonPressedEvent
): Option<Lift> => {

  const newLift: Lift = {
      floor: lift.floor,
      availableFloors: lift.availableFloors,
      floorRequests: [...lift.floorRequests, event]
  };
  return (lift.availableFloors.includes(event.floor))? 
    Option.of<Lift>(newLift):
    new None<Lift>();
};

const processLiftArrivalEventForLift = (
  lift: Lift, 
  event: LiftArrivalEvent)
  : Lift=> {
    return {
      floor: event.floor,
      availableFloors: lift.availableFloors,
      floorRequests: lift.floorRequests.filter(r => r.floor !== event.floor)
    };
  }

const processLiftArrivalEventForLiftRequests = (
  requests: LiftRequests, 
  event: LiftArrivalEvent)
  : LiftRequests => {
    const result: LiftRequests = requests.filter(x => x.onFloor !== event.floor);
    return result;
  };

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
    state.lift.floor;
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
      lift: processFloorRequestEventForLift(state.lift, event).getOrElse(state.lift),
      liftRequests: state.liftRequests
    };
  };

export {Direction, Floor, EpochTime, LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivalEvent, listAppend, LiftRequests, Lift, processFloorRequestEventForLift, processLiftArrivalEventForLift, processLiftArrivalEventForLiftRequests, processLiftRequestEvent, SystemState, getLiftMoveStrategy1, applyMoveEvent, applyFloorRequestEvent};

