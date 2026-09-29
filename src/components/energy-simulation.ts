export type EnergyControls = {
  blowing: boolean;
  lights: boolean;
  fan: boolean;
  dark: boolean;
  reducedMotion: boolean;
};

export type EnergyActivity = {
  wind: boolean;
  solar: boolean;
};

export type EnergyState = {
  wind: number;
  battery: number;
  rotorAngle: number;
  fanAngle: number;
  time: number;
};

export const initialEnergyState = (): EnergyState => ({
  wind: 0,
  battery: 0.62,
  rotorAngle: 0,
  fanAngle: 0,
  time: 0,
});

/** Scaled demonstration values, not measurements of real equipment. */
export function stepEnergy(
  state: EnergyState,
  controls: EnergyControls,
  seconds: number,
  activity: EnergyActivity = { wind: true, solar: true },
): EnergyState {
  if (!activity.wind && !activity.solar) return state;
  // A resumed tab must never spend the battery in a single frame.
  const dt = Math.min(Math.max(Number.isFinite(seconds) ? seconds : 0, 0), 0.1);
  let wind = state.wind;
  if (activity.wind) {
    wind += ((controls.blowing ? 1 : 0) - wind) *
      (1 - Math.exp(-(controls.blowing ? 1.2 : 0.55) * dt));
    if (!controls.blowing && wind < 0.002) wind = 0;
  }
  const supply = controls.dark ? 0 : 0.022;
  const demand = (controls.lights ? 0.0035 : 0) + (controls.fan ? 0.0055 : 0);
  const battery = activity.solar
    ? Math.min(1, Math.max(0, state.battery + (supply - demand) * dt))
    : state.battery;
  const powered = !controls.dark || battery > 0;
  return {
    wind,
    battery,
    rotorAngle: !activity.wind || controls.reducedMotion ? state.rotorAngle : (state.rotorAngle + wind * dt * 5.4) % (Math.PI * 2),
    fanAngle: !activity.solar || controls.reducedMotion || !controls.fan || !powered
      ? state.fanAngle : (state.fanAngle + dt * 13) % (Math.PI * 2),
    time: state.time + dt,
  };
}

export function batteryStatus(state: EnergyState, controls: EnergyControls) {
  if (!controls.dark) return state.battery >= 1 ? "Fully charged" : "Charging";
  if (state.battery <= 0) return "Battery empty";
  return controls.lights || controls.fan ? "On battery" : "Stored energy";
}

export function energyIsChanging(
  state: EnergyState,
  controls: EnergyControls,
  activity: EnergyActivity = { wind: true, solar: true },
) {
  return (activity.wind && (controls.blowing || state.wind > 0)) || (activity.solar && (
    (!controls.dark && state.battery < 1) ||
    (controls.dark && state.battery > 0 && (controls.lights || controls.fan)) ||
    (!controls.reducedMotion && controls.fan && (!controls.dark || state.battery > 0))
  ));
}
