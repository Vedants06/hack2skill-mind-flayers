import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, orderBy } from '../firebase/firebase';
import RiskDisplay from './RiskDisplay';

const History = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <h1 className="text-3xl font-bold text-gray-800">History & Past Reports</h1>
      {history.map((report) => (
        <div key={report.id} className="border-t-4 border-emerald-500 pt-6">
          <p className="text-sm text-gray-500 mb-4 font-mono">
            Analyzed on: {report.createdAt.toDate().toLocaleString()}
          </p>
          {/* Reuse the same display component! */}
          <RiskDisplay data={report.analysis} />
        </div>
      ))}
    </div>
  );
};

export default History;