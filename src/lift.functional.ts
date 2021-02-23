

export enum Direction {Up,  Down};

export type Floor = number;
export type EpochTime = number;

export interface LiftRequestButtonPressedEvent {
  onFloor: Floor,
  direction: Direction,
  timeEpoch: EpochTime
};

export interface FloorRequestButtonPressedEvent {
  floor: Floor;
};

export interface LiftArrivalEvent {
  floor: Floor
}


