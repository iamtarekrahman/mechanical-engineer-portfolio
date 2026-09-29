/** Lightweight copy for the engine inspector; deliberately independent of Three.js. */
export const ENGINE_PARTS = [
  {
    id: "fan",
    name: "Intake fan",
    shortName: "Fan",
    description:
      "Swept blades draw air into the engine. The central spinner guides the incoming flow around the hub and into the rotating fan.",
  },
  {
    id: "compressor",
    name: "Axial compressor",
    shortName: "Compressor",
    description:
      "Successive rows of rotating blades and stationary vanes raise the pressure of the air before it reaches the combustion section.",
  },
  {
    id: "combustor",
    name: "Combustion section",
    shortName: "Combustor",
    description:
      "An array of combustion liners surrounds the central shaft. Here, compressed air mixes with fuel and releases energy as a continuous hot gas flow.",
  },
  {
    id: "turbine",
    name: "Turbine stages",
    shortName: "Turbine",
    description:
      "Hot gas expands through the turbine blades, transferring energy to the shaft that drives the fan and compressor upstream.",
  },
  {
    id: "nozzle",
    name: "Exhaust nozzle",
    shortName: "Nozzle",
    description:
      "The tapered exhaust passage and centre cone guide the gas leaving the turbine, converting the remaining flow energy into a directed jet.",
  },
  {
    id: "casing",
    name: "Nacelle & casing",
    shortName: "Casing",
    description:
      "The outer structure supports and encloses the engine. An open section reveals the sequence of components and their shared longitudinal axis.",
  },
] as const;

export type EnginePartId = (typeof ENGINE_PARTS)[number]["id"];
