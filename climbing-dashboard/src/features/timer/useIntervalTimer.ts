import { useEffect, useState } from "react";
import type { TimerConfig, TimerPhase } from "./types";

export const useIntervalTimer = (config: TimerConfig) => {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const totalCycles = Math.max(1, config.cycles);
  const totalSets = Math.max(1, config.sets);

  const start = () => {
    setCurrentCycle(1);
    setCurrentSet(1);

    if (config.prep > 0) {
      setPhase("prep");
      setTimeLeft(config.prep);
    } else {
      setPhase("work");
      setTimeLeft(config.work);
    }
  };

  useEffect(() => {
    if (phase === "idle" || phase === "finished") return;
  
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
  
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (phase === "idle" || phase === "finished") return;
  
    if (phase === "prep") {
      setPhase("work");
      setTimeLeft(config.work);
      return;
    }
  
    if (phase === "work") {
      const isLastCycle = currentCycle >= totalCycles;
      const isLastSet = currentSet >= totalSets;
  
      if (!isLastCycle) {
        if (config.rest > 0) {
          setPhase("rest");
          setTimeLeft(config.rest);
        } else {
          setCurrentCycle((c) => c + 1);
          setPhase("work");
          setTimeLeft(config.work);
        }
        return;
      }
  
      if (!isLastSet) {
        if (config.restBetweenSets > 0) {
          setPhase("restBetweenSets");
          setTimeLeft(config.restBetweenSets);
        } else {
          setCurrentSet((s) => s + 1);
          setCurrentCycle(1);
          setPhase("work");
          setTimeLeft(config.work);
        }
        return;
      }
  
      setPhase("finished");
      return;
    }
  
    if (phase === "rest") {
      setCurrentCycle((c) => c + 1);
      setPhase("work");
      setTimeLeft(config.work);
      return;
    }
  
    if (phase === "restBetweenSets") {
      setCurrentSet((s) => s + 1);
      setCurrentCycle(1);
      setPhase("work");
      setTimeLeft(config.work);
    }
  }, [
    timeLeft,
    phase,
    currentCycle,
    currentSet,
    totalCycles,
    totalSets,
    config.work,
    config.rest,
    config.restBetweenSets,
  ]);

  // useEffect(() => {
  //   if (phase === "idle" || phase === "finished") return;
  
  //   const interval = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev > 1) {
  //         return prev - 1;
  //       }

  //       if (phase === "prep") {
  //         setPhase("work");
  //         return config.work;
  //       }

  //       if (phase === "work") {
  //         const isLastCycleInSet = currentCycle >= totalCycles;
  //         const isLastSet = currentSet >= totalSets;

  //         if (!isLastCycleInSet) {
  //           if (config.rest > 0) {
  //             setPhase("rest");
  //             return config.rest;
  //           }

  //           setCurrentCycle((cycle) => cycle + 1);
  //           setPhase("work");
  //           return config.work;
  //         }

  //         if (!isLastSet) {
  //           if (config.restBetweenSets > 0) {
  //             setPhase("restBetweenSets");
  //             return config.restBetweenSets;
  //           }

  //           setCurrentSet((set) => set + 1);
  //           setCurrentCycle(1);
  //           setPhase("work");
  //           return config.work;
  //         }

  //         setPhase("finished");
  //         return 0;
  //       }

  //       if (phase === "rest") {
  //         setCurrentCycle((cycle) => cycle + 1);
  //         setPhase("work");
  //         return config.work;
  //       }

  //       if (phase === "restBetweenSets") {
  //         setCurrentSet((set) => set + 1);
  //         setCurrentCycle(1);
  //         setPhase("work");
  //         return config.work;
  //       }

  //       return 0;
  //     });
  //   }, 1000);
  
  //   return () => clearInterval(interval);
  // }, [
  //   phase,
  //   currentCycle,
  //   currentSet,
  //   totalCycles,
  //   totalSets,
  //   config.work,
  //   config.rest,
  //   config.restBetweenSets,
  // ]);

  const pause = () => {
    console.log("pause");
  };

  const reset = () => {
    setPhase("idle");
    setTimeLeft(0);
    setCurrentCycle(1);
    setCurrentSet(1);
  };

  return {
    phase,
    timeLeft,
    currentCycle,
    currentSet,
    start,
    pause,
    reset,
  };
};