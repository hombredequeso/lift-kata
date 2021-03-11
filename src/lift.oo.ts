import {
  Direction, Floor,
  LiftRequestButtonPressedEvent, FloorRequestButtonPressedEvent, LiftArrivedEvent
} from './events'

class Lift {
  constructor(floor: Floor, availableFloors: Floor[]) {
    this._floor = floor;
    this._availableFloors = availableFloors;
    this._floorRequests = [];
  }

  moveTo(floor: Floor) {
    if (this._availableFloors.includes(floor)) {
      this._floor = floor;
      this._floorRequests = 
        this._floorRequests.filter(r => r.floor !== floor);
    }
  }

  get floor() {
    return this._floor;
  }

  get availableFloors() {
    return this._availableFloors;
  }

  get floorRequests() {
    return this._floorRequests;
  }

  addRequest(floorRequest: FloorRequestButtonPressedEvent) {
    this._floorRequests.push(floorRequest);
  }

  private _floor: Floor;
  private _availableFloors: Floor[];
  private _floorRequests: FloorRequestButtonPressedEvent[];
}

class LiftRequests {
  constructor() {
    this._requests = [];
  }

  get requests() {
    return this._requests;
  }

  addRequest(request: LiftRequestButtonPressedEvent) {
    this._requests.push(request);
  }

  cancel(floor: Floor) {
    this._requests = this.requests.filter(r => r.onFloor != floor);
  }

  private _requests: LiftRequestButtonPressedEvent[]
}

interface SystemState {
  _lift: Lift;
  _liftRequests: LiftRequests;
}

class LiftRequestButtonPressedEventHander {
  constructor(state: SystemState) {
    this._state = state;
  }
  private _state: SystemState;

  handle(event: LiftRequestButtonPressedEvent) {
    this._state._liftRequests.addRequest(event);
  }
}

class FloorRequestButtonPressedEventHandler {
  constructor(state: SystemState) {
    this._state = state;
  }
  private _state: SystemState;

  handle(event: FloorRequestButtonPressedEvent) {
    this._state._lift.addRequest(event);
  }
}

class LiftArrivedEventHandler {
  constructor(state: SystemState) {
    this._state = state;
  }
  private _state: SystemState;

  handle(event: LiftArrivedEvent) {
    this._state._lift.moveTo(event.floor);
    this._state._liftRequests.cancel(event.floor);
  }
}

export {
  Lift, LiftRequests
}
