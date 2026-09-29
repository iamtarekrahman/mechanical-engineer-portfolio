import type * as THREE from "three";

/** All energy values are an illustrative simulation, normalized to 0–1. */
export type EnergyFrame = {
  dark: boolean;
  wind: number;
  rotorAngle: number;
  fanAngle: number;
  battery: number;
  lightsOn: boolean;
  fanOn: boolean;
  reducedMotion: boolean;
  time: number;
};

export type EnergyModel = {
  root: THREE.Group;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    /** Vertical span before the renderer fits the model to a narrow viewport. */
    span: number;
  };
  update: (frame: EnergyFrame) => void;
  dispose: () => void;
};
