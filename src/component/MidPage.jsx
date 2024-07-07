import React from "react";
import hero from "../assets/hero.jpg";
import { useNavigate } from "react-router-dom";
import "./Midpage.css";

const MidPage = () => {
  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate("/market-scan");
  };
  return (
    <div className="MidPage-Section">
      <div className="Image-Wrapper">
        <img className="Right-img" src={hero} alt="heroimg" />
        <div className="header-text">
          <span className="header-span">Scanner</span>
        </div>
        <div className="Left-Midpage-Text">
          <span className="main-text">Look first/</span>
          <span className="main-text">Then leap.</span>
          <div>
            <p className="p-text">
              The best trades require research then,
              <br />
              commitment.
            </p>
              <button className="search-button" onClick={handleButtonClick}>
                Search Market wide scan
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidPage;
