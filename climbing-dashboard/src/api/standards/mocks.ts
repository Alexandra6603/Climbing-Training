import type { Standard, StandardsAttempt } from "./types";

export const standards: Standard[] = [
  {
    id: "deadHangLeft",
    name: "Dead hang L",
    unit: "kg",
  },
  {
    id: "deadHangRight",
    name: "Dead hang R",
    unit: "kg",
  },
  {
    id: "pinchLeft",
    name: "Pinch L",
    unit: "kg",
  },
  {
    id: "pinchRight",
    name: "Pinch R",
    unit: "kg",
  },
  {
    id: "plank",
    name: "Plank",
    unit: "sec",
  },
  {
    id: "hang",
    name: "Hang",
    unit: "sec",
  },
  {
    id: "pullUp",
    name: "Pull up",
    unit: "rep",
  },
];


export const standardsAttempts: StandardsAttempt[] = [
  {
    id: "2026-05",
    date: "2026-05-12T13:56:34.813Z",
    status: 'completed',
    values: {
      deadHangLeft: 31,
      deadHangRight: 31,
      pinchLeft: 15,
      pinchRight: 17,
      hang: 100,
      pullUp: 10,
      plank: 45,
    },
  },
  {
    id: "2025-12",
    date: "2025-12-12T13:56:34.813Z",
    status: 'completed',
    values: {
      deadHangLeft: 23,
      deadHangRight: 25,
      pinchLeft: 12,
      pinchRight: 15,
      hang: 60,
      pullUp: 6,
    },
  },
];