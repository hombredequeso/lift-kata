import { Option, None} from 'tsoption'

enum Direction {Up,  Down}

type Floor = number;
type EpochTime = number;

const listAppend = <T>(ts: T[], t: T): T[] => [...ts, t];

interface LiftRequestButtonPressedEvent {
  onFloor: Floor,
  direction: Direction,
  timeEpoch: EpochTime
}

interface FloorRequestButtonPressedEvent {
  floor: Floor;
}

interface LiftArrivedEvent {
  floor: Floor
}

type LiftRequests = LiftRequestButtonPressedEvent[];

interface Lift {
  floor: Floor,
  availableFloors: Floor[],
  floorRequests: FloorRequestButtonPressedEvent[]
}

const processFloorRequestEventForLift = 
  (lift: Lift,
    event: FloorRequestButtonPressedEvent
  )
  : Option<Lift> => (
    (lift.availableFloors.includes(event.floor))? 
    Option.of<Lift>(
      {
        floor: lift.floor,
        availableFloors: lift.availableFloors,
        floorRequests: [...lift.floorRequests, event]
      }):
    new None<Lift>());

const processLiftArrivedEventForLift = 
  (lift: Lift, 
  event: LiftArrivedEvent)
  : Lift=> (
    {
      floor: event.floor,
      availableFloors: lift.availableFloors,
      floorRequests: lift.floorRequests.filter(r => r.floor !== event.floor)
    });

const processLiftArrivedEventForLiftRequests = 
  (requests: LiftRequests, 
  event: LiftArrivedEvent)
  : LiftRequests => 
  requests.filter(x => x.onFloor !== event.floor);

const processLiftRequestEvent = listAppend;

interface SystemState {
  lift: Lift,
  liftRequests: LiftRequests
}

const getLiftMoveStrategy1 = 
  (state: SystemState)
  : Floor => {
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

const applyLiftArrivedEvent = 
  (state: SystemState, 
  moveEvent: LiftArrivedEvent)
  : SystemState => (
    {
      lift: processLiftArrivedEventForLift(state.lift, moveEvent),
      liftRequests: processLiftArrivedEventForLiftRequests(state.liftRequests, moveEvent)
    });

const applyFloorRequestEvent = 
  (state: SystemState, 
  event: FloorRequestButtonPressedEvent)
  : SystemState => (
    {
      lift: processFloorRequestEventForLift(state.lift, event).getOrElse(state.lift),
      liftRequests: state.liftRequests
    });

const applyLiftRequestEvent = 
  (state: SystemState,
  event: LiftRequestButtonPressedEvent)
  : SystemState => ({
    lift: state.lift,
    liftRequests: processLiftRequestEvent(state.liftRequests, event)
  });

export {Direction, Floor, EpochTime, 
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivedEvent, 
  listAppend, LiftRequests, Lift, 
  processFloorRequestEventForLift, processLiftArrivedEventForLift, 
  processLiftArrivedEventForLiftRequests, processLiftRequestEvent, 
  SystemState, getLiftMoveStrategy1, 
  applyLiftArrivedEvent, applyFloorRequestEvent, applyLiftRequestEvent};

