import { useState } from 'react';

function App() {
  const [backendData, setBackendData] = useState(null);

  const fetchSortingSteps = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ array: [50, 20, 80, 10, 30] })
      });

      const data = await response.json();
      setBackendData(data);
      console.log("Data from C++:", data);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-4xl font-bold mb-8">Algorithm Visualizer</h1>

      <button 
        onClick={fetchSortingSteps}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
      >
        Ping C++ Backend
      </button>

      {backendData && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg w-full max-w-md">
          <h2 className="text-xl text-green-400 mb-4">Connection Successful!</h2>
          <pre className="text-sm text-gray-300 bg-gray-950 p-4 rounded overflow-x-auto">
            {JSON.stringify(backendData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;