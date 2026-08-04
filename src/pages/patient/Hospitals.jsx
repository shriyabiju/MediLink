import React from "react";
import SearchBar from "./components/SearchBar";
import HospitalCard from "./components/HospitalCard";
import "./css/Hospitals.css";

const hospitalData = [
  {
    id: 1,
    name: "Apollo Hospital",
    rating: 4.8,
    distance: 2.1,
    bedsAvailable: true,
    doctors: [
      "Dr. Rahul Sharma - Cardiologist",
      "Dr. Priya Patel - General Physician",
      "Dr. Amit Mehta - Orthopedic",
    ],
    bloodAvailability: {
      "A+": "Available",
      "B+": "Available",
      "O+": "Available",
      "AB+": "Limited",
    },
  },

  {
    id: 2,
    name: "Sterling Hospital",
    rating: 4.6,
    distance: 4.5,
    bedsAvailable: false,
    doctors: [
      "Dr. Neha Shah - Neurologist",
      "Dr. Raj Mehta - Pediatrician",
    ],
    bloodAvailability: {
      "A+": "Available",
      "B+": "Limited",
      "O+": "Available",
      "AB+": "Available",
    },
  },
];

const Hospitals = () => {
  return (
    <div>
      <h1 style={{ color: "red" }}>THIS IS MY NEW HOSPITAL PAGE</h1>
    </div>
  );
};

export default Hospitals;