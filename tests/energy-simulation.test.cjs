const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const filename = path.join(__dirname, "../src/components/energy-simulation.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
const loaded = { exports: {} };
new Function("exports", "module", compiled)(loaded.exports, loaded);
const { initialEnergyState, stepEnergy, batteryStatus, energyIsChanging } = loaded.exports;
const controls = changes => ({ blowing: false, lights: false, fan: false, dark: false, reducedMotion: false, ...changes });
function run(state, input, seconds, fps = 30, activity) {
  for (let n = 0; n < seconds * fps; n++) state = stepEnergy(state, input, 1 / fps, activity);
  return state;
}

test("holding accelerates the rotor; releasing coasts to a complete stop", () => {
  const start = initialEnergyState();
  const moving = run(start, controls({ blowing: true }), 4);
  assert.ok(moving.wind > 0.98);
  assert.notEqual(moving.rotorAngle, start.rotorAngle);
  const released = stepEnergy(moving, controls(), 1 / 30);
  assert.ok(released.wind > 0 && released.wind < moving.wind);
  assert.equal(run(released, controls(), 14).wind, 0);
});

test("daylight charges with both loads on, caps at full, and night consumes stored power", () => {
  const input = controls({ lights: true, fan: true });
  const charged = run(initialEnergyState(), input, 40);
  assert.equal(charged.battery, 1);
  assert.equal(batteryStatus(charged, input), "Fully charged");
  const night = { ...input, dark: true };
  const discharged = run(charged, night, 5);
  assert.ok(discharged.battery < 1 && discharged.battery > 0.9);
  assert.equal(batteryStatus(discharged, night), "On battery");
  assert.equal(input.fan, true);
  assert.equal(input.lights, true);
});

test("nighttime appliances stop at empty and daylight restarts the fan", () => {
  const night = controls({ dark: true, lights: true, fan: true });
  const empty = run({ ...initialEnergyState(), battery: 0.005 }, night, 2);
  assert.equal(empty.battery, 0);
  const still = run(empty, night, 1);
  assert.equal(still.fanAngle, empty.fanAngle);
  assert.equal(batteryStatus(still, night), "Battery empty");
  const daylight = stepEnergy(still, { ...night, dark: false }, 1 / 30);
  assert.ok(daylight.battery > 0);
  assert.notEqual(daylight.fanAngle, still.fanAngle);
});

test("night with switches off retains charge and can stop the animation loop", () => {
  const input = controls({ dark: true });
  const start = initialEnergyState();
  assert.equal(run(start, input, 30).battery, start.battery);
  assert.equal(batteryStatus(start, input), "Stored energy");
  assert.equal(energyIsChanging(start, input), false);
  assert.equal(energyIsChanging({ ...start, battery: 1 }, controls()), false);
});

test("reduced motion retains power controls without rotating either model", () => {
  const start = initialEnergyState();
  const next = run(start, controls({ reducedMotion: true, blowing: true, fan: true }), 3);
  assert.ok(next.wind > 0.9);
  assert.ok(next.battery > start.battery);
  assert.equal(next.rotorAngle, start.rotorAngle);
  assert.equal(next.fanAngle, start.fanAngle);
});

test("battery and acceleration are frame-rate independent; long resumes are bounded", () => {
  const input = controls({ blowing: true, dark: true, fan: true });
  const at30 = run(initialEnergyState(), input, 4, 30);
  const at60 = run(initialEnergyState(), input, 4, 60);
  assert.ok(Math.abs(at30.wind - at60.wind) < 1e-10);
  assert.ok(Math.abs(at30.battery - at60.battery) < 1e-10);
  const resumed = stepEnergy(initialEnergyState(), input, 3600);
  assert.ok(resumed.battery > 0.61);
  assert.ok(Number.isFinite(stepEnergy(initialEnergyState(), input, NaN).battery));
});

test("closed solar preserves charge and fan angle while the wind scene runs", () => {
  const start = { ...initialEnergyState(), fanAngle: 1.25 };
  const activity = { wind: true, solar: false };
  for (const dark of [false, true]) {
    const input = controls({ blowing: true, lights: true, fan: true, dark });
    const next = run(start, input, 3, 30, activity);
    assert.equal(next.battery, start.battery);
    assert.equal(next.fanAngle, start.fanAngle);
    assert.ok(next.wind > 0.9);
    assert.notEqual(next.rotorAngle, start.rotorAngle);
    assert.equal(energyIsChanging(start, { ...input, blowing: false }, activity), false);
  }
});

test("closed wind preserves momentum and rotor angle while the solar scene runs", () => {
  const start = { ...initialEnergyState(), wind: 0.7, rotorAngle: 2.3 };
  const activity = { wind: false, solar: true };
  const input = controls({ blowing: true, fan: true });
  const next = run(start, input, 3, 30, activity);
  assert.equal(next.wind, start.wind);
  assert.equal(next.rotorAngle, start.rotorAngle);
  assert.ok(next.battery > start.battery);
  assert.notEqual(next.fanAngle, start.fanAngle);
  assert.equal(energyIsChanging(start, input, activity), true);
  assert.equal(energyIsChanging(start, controls({ blowing: true, dark: true }), activity), false);
});

test("both closed scenes remain idle and reopening continues from preserved state", () => {
  const start = { ...initialEnergyState(), wind: 0.7, rotorAngle: 2.3, fanAngle: 1.25, time: 12 };
  const input = controls({ lights: true, fan: true, dark: true });
  const closed = { wind: false, solar: false };
  const paused = run(start, input, 10, 30, closed);
  assert.deepEqual(paused, start);
  assert.equal(energyIsChanging(paused, input, closed), false);
  assert.equal(energyIsChanging(paused, { ...input, blowing: true }, closed), false);

  const resumed = stepEnergy(paused, input, 1 / 30, { wind: true, solar: true });
  assert.ok(resumed.wind > 0.6 && resumed.wind < paused.wind);
  assert.ok(resumed.battery < paused.battery);
  assert.notEqual(resumed.rotorAngle, paused.rotorAngle);
  assert.notEqual(resumed.fanAngle, paused.fanAngle);
  assert.ok(resumed.time > paused.time);
  assert.equal(energyIsChanging(resumed, input, { wind: true, solar: true }), true);
});
