// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import MidPage from "./component/MidPage";
import MarketScan from "./component/MarketScan";
import MarketScanNext from "./component/MarketScanNext";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MidPage />} />
      <Route path="/market-scan" element={<MarketScan />} />
    </Routes>
  );
};

export default App;
