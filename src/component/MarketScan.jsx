import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MarketScan.css";
import Loader from "./Loader"; 

const MarketScan = () => {
  const [symbol, setSymbol] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [stepOneData, setStepOneData] = useState("");
  const [csvPaths, setCsvPaths] = useState([]);
  const [fetchMessage, setFetchMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [NOD, setNOD] = useState("W");
  const [MA, setMA] = useState(60);
  const [columnName, setColumnName] = useState("Weekly");
  const [calculatedParams, setCalculatedParams] = useState("");
  const [loading, setLoading] = useState({
    stepOne: false,
    csvPaths: false,
    calculateParams: false,
    fetchResults: false,
  });
  const isCalculating = useRef(false);

  const fetchStepOneData = async () => {
    setLoading({ ...loading, stepOne: true }); 
    try {
      const response = await fetch("http://127.0.0.1:8000/get_data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Step 1 API Response:", data);

      setStepOneData(data.message);
      setSuccessMessage("Step 1 Data fetched successfully");
      setError(null);
      toast.success("Step 1 Data fetched successfully");
    } catch (error) {
      setError(error.message);
      toast.error(`Error fetching Step 1 Data: ${error.message}`);
    } finally {
      setLoading({ ...loading, stepOne: false }); 
    }
  };

  const fetchCsvPaths = async () => {
    setLoading({ ...loading, csvPaths: true }); 
    try {
      const response = await fetch("http://127.0.0.1:8000/get_paths");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("CSV Paths:", data);

      setCsvPaths(data);
      setFetchMessage("CSV Paths: retrieved paths successfully");
      toast.success("CSV Paths: retrieved paths successfully");
      setError(null);
    } catch (error) {
      setError(error.message);
      setFetchMessage(`Error fetching CSV paths: ${error.message}`);
      toast.error(`Error fetching CSV paths: ${error.message}`);
    } finally {
      setLoading({ ...loading, csvPaths: false }); 
    }
  };

  useEffect(() => {
    fetchStepOneData();
  }, []);

  const handleFetchCsvPaths = () => {
    fetchCsvPaths();
  };

  const handleButtonClick = async () => {
    setLoading({ ...loading, fetchResults: true }); 
    try {
      const response = await fetch("http://127.0.0.1:8000/get_result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Step 2 API Response:", data.result);

      setResults(data.result);
      setError(null);
      toast.success("Results fetched successfully");
    } catch (error) {
      setError(error.message);
      setResults([]);
      toast.error(`Error fetching Results: ${error.message}`);
    } finally {
      setLoading({ ...loading, fetchResults: false });
    }
  };

  const handleCalculateParameters = async () => {
    if (isCalculating.current) return;

    isCalculating.current = true;
    setLoading({ ...loading, calculateParams: true });

    try {
      const response = await fetch("http://127.0.0.1:8000/give_parameters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ NOD, MA, column_name: columnName }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Step 4 API Response:", data);

      setCalculatedParams(data);
      toast.success("Parameters calculated and saved successfully");
      setError(null);
    } catch (error) {
      setError(error.message);
      toast.error(`Error calculating parameters: ${error.message}`);
    } finally {
      isCalculating.current = false;
      setLoading({ ...loading, calculateParams: false }); 
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      results.map((result) => Object.values(result).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "market_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewMore = () => {
    setShowAll(true);
  };

  const visibleResults = showAll ? results : results.slice(0, 100);

  return (
    <div className="Market-main">
      <div className="Market-Analysis">
        <div className="step-one">
          <span className="Market-Anaysis-1">Step 1</span>
          {loading.stepOne ? <Loader /> : <div>{stepOneData}</div>}
          <button onClick={fetchStepOneData}>Fetch Data</button>
          {successMessage && <p>{successMessage}</p>}
        </div>

        <div className="step-two">
          <span className="step-two-span">Step 2</span>
          <div className="csv-paths">
            <button onClick={handleFetchCsvPaths}>Fetch CSV Paths</button>
            {fetchMessage && <p>{fetchMessage}</p>}
            {loading.csvPaths ? (
              <Loader />
            ) : (
              Array.isArray(csvPaths) &&
              csvPaths.length > 0 && (
                <div className="csv-paths">
                  <h3>CSV File Paths:</h3>
                  <ul>
                    {csvPaths.map((path, index) => (
                      <li key={index}>{path}</li>
                    ))}
                  </ul>
                </div>
              )
            )}
            {error && <div>Error fetching CSV paths: {error}</div>}
          </div>
        </div>
        <div className="step-four">
          <span className="Market-Anaysis-1">Step 3</span>
          <input
            type="text"
            value={NOD}
            onChange={(e) => setNOD(e.target.value)}
            placeholder="Enter NOD (e.g., W for weekly)"
          />
          <input
            type="text"
            value={MA}
            onChange={(e) => setMA(parseInt(e.target.value))}
            placeholder="Enter MA (e.g., 60)"
          />
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            placeholder="Enter column name (e.g., Weekly)"
          />
          <button onClick={handleCalculateParameters}>
            Calculate Parameters
          </button>
          {loading.calculateParams ? (
            <Loader />
          ) : (
            calculatedParams && (
              <div className="calculated-params">
                <h3>Calculated Parameters:</h3>
                <pre>{JSON.stringify(calculatedParams, null, 2)}</pre>
              </div>
            )
          )}
        </div>
        <div className="step-three">
          <span className="step-three-span">Step 3:</span>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol"
          />
          <button onClick={handleButtonClick}>Click Here To get Result</button>
          <button onClick={downloadCSV} disabled={results.length === 0}>
            Download CSV
          </button>
          {visibleResults.length > 0 && (
            <div>
              <h3>Results:</h3>
              <div className="table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th className="results-table-params">Date</th>
                      <th className="results-table-params">Open</th>
                      <th className="results-table-params">High</th>
                      <th className="results-table-params">Low</th>
                      <th className="results-table-params">Close</th>
                      <th className="results-table-params">Adj Close</th>
                      <th className="results-table-params">Volume</th>
                      <th className="results-table-params">Weekly</th>
                      <th className="results-table-params">60ma</th>
                      <th className="results-table-params">Extent of Fall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleResults.map((result, index) => (
                      <tr key={index}>
                        <td>{result.Date}</td>
                        <td>{result.Open}</td>
                        <td>{result.High}</td>
                        <td>{result.Low}</td>
                        <td>{result.Close}</td>
                        <td>{result["Adj Close"]}</td>
                        <td>{result.Volume}</td>
                        <td>{result.Weekly}</td>
                        <td>{result["60ma"]}</td>
                        <td>{result.extent_of_fall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!showAll && (
                <button className="view-more-button" onClick={handleViewMore}>
                  View More
                </button>
              )}
            </div>
          )}
          {error && <div>Error: {error}</div>}
        </div>

      </div>
      <ToastContainer />
    </div>
  );
};

export default MarketScan;
