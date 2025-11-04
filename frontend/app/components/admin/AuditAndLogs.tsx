import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/mockApi";

export default function AuditAndLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getAuditLogs("ce4r90d4").then(setLogs);
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow mt-4">
      <h2 className="text-xl font-bold mb-3">Audit & Data Access Logs</h2>
      {logs.length === 0 ? (
        <p className="text-gray-400 text-sm">No logs available yet.</p>
      ) : (
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th>Time</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-800">
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.message}</td>
                <td className="text-green-400">{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
