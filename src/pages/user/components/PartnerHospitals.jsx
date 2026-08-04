import "../css/partnerHospitals.css";

const hospitals = [
  { name: "City General Hospital", location: "New York" },
  { name: "Sunrise Medical Center", location: "Los Angeles" },
  { name: "Green Valley Hospital", location: "Chicago" },
  { name: "Metro Health Clinic", location: "Houston" },
  { name: "National Care Hospital", location: "Phoenix" },
  { name: "Unity Medical Center", location: "Philadelphia" },
];

const PartnerHospitals = () => {
  return (
    <section className="partner-hospitals">
      <h2>Our Partner Hospitals</h2>
      <p>Trusted healthcare institutions across the country</p>
      <div className="hospitals-grid">
        {hospitals.map((hospital, index) => (
          <div className="hospital-card" key={index}>
            <img src="../assets/hospital.png" alt={hospital.name} />
            <h3>{hospital.name}</h3>
            <p>{hospital.location}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartnerHospitals;
