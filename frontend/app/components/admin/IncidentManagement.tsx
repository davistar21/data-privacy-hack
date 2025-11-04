import React, { useEffect, useState } from "react";
import { getIncidents } from "../../api/mockApi";

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    getIncidents().then(setIncidents);
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow mt-4">
      <h2 className="text-xl font-bold mb-3">Incident Management</h2>
      {incidents.length === 0 ? (
        <p className="text-gray-400 text-sm">No incidents detected.</p>
      ) : (
        <ul className="space-y-3">
          {incidents.map((i) => (
            <li key={i.id} className="p-3 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-red-400">
                  {i.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(i.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-300 mt-1">{i.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                Severity: {i.severity}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
