import { useEffect, useRef } from "react";

export default function useIncidentLogger(
  incidents,
  incidentsVersion,
  logger = console.log
) {
  const lastSeenRef = useRef(0);

  useEffect(() => {
    if (incidentsVersion > lastSeenRef.current) {
      const newCount = incidentsVersion - lastSeenRef.current;
      const slice = incidents.slice(-newCount);
      for (const ev of slice) {
        if (ev && typeof ev.message === "string") logger(ev.message);
      }
      lastSeenRef.current = incidentsVersion;
    }
  }, [incidentsVersion, incidents, logger]);
}
