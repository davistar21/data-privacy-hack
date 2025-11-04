import React, { useEffect, useState } from "react";
import { getDSRRequests } from "../../api/mockApi";

export default function DSRHandling() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    getDSRRequests().then(setRequests);
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow mt-4">
      <h2 className="text-xl font-bold mb-3">Data Subject Requests (DSR)</h2>
      <table className="w-full text-sm border-collapse">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Type</th>
            <th>Time Left</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-gray-800">
              <td>{r.id}</td>
              <td>{r.user}</td>
              <td>{r.type}</td>
              <td>{r.timeLeft}</td>
              <td className="text-yellow-400">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
