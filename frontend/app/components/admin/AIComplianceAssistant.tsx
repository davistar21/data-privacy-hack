import React, { useState, useEffect } from "react";
import { getComplianceInsights } from "../../api/mockApi";

export default function AIComplianceAssistant() {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplianceInsights().then((data) => {
      setInsight(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4">Analyzing compliance data...</div>;

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow mt-4">
      <h2 className="text-xl font-bold mb-3">NDPR Compliance AI Assistant</h2>
      <p className="text-gray-300">{insight.reportSummary}</p>
      <p className="text-green-400 mt-2">{insight.recommendation}</p>
      <p className="text-sm text-gray-500 mt-2">
        Reference: {insight.reference}
      </p>
    </div>
  );
}
