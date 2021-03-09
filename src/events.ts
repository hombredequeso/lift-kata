
enum Direction {Up,  Down}

type Floor = number;
type EpochTime = number;

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


export {
  Direction, Floor, EpochTime, 
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivedEvent
}
