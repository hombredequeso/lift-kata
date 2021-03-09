import {
  Direction, Floor
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivedEvent
} from './events'

class Lift {
  private _floor: Floor,
  private _availableFloors: Floor[],
  private _floorRequests: FloorRequestButtonPressedEvent[]
}

class LiftRequests {
  private _requests: LiftRequestButtonPressedEvent[]
}

