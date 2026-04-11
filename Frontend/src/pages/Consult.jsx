import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { fetchConsultants } from "../store/consultantThunk";
import "./consult.css";

export default function Consult() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [animate, setAnimate] = useState(false);
  const { items, loading, error } = useSelector((state) => state.consultant);

  useEffect(() => {
    document.body.classList.remove("page-exit");
    setAnimate(true);
    dispatch(fetchConsultants());
  }, [dispatch]);

  const goToDetail = (consultantId) => {
    document.body.classList.add("page-exit");
    setTimeout(() => {
      navigate("/consult-detail", { state: { consultantId } });
    }, 300);
  };

  const getConsultantPhoto = (consultant) =>
    consultant?.photo ||
    consultant?.photoUrl ||
    consultant?.image ||
    consultant?.foto ||
    null;
  const getConsultantPrice = (consultant) => {
    const rawPrice =
      consultant?.harga_per_sesi ??
      consultant?.sessionFee ??
      consultant?.perSessionFee ??
      consultant?.fee ??
      consultant?.price ??
      consultant?.harga;

    if (typeof rawPrice === "number") {
      return rawPrice;
    }

    if (typeof rawPrice === "string") {
      const parsedPrice = Number.parseInt(rawPrice.replace(/[^\d]/g, ""), 10);
      return Number.isNaN(parsedPrice) ? null : parsedPrice;
    }

    return null;
  };
  const formatConsultantPrice = (consultant) => {
    const price = getConsultantPrice(consultant);
    return price === null
      ? "Fee not set"
      : `IDR. ${price.toLocaleString("id-ID")} / Session`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu="Consult" />

      <main className={`main-content ${animate ? "page-enter" : ""}`}>
        <div className="consult-header">
          <h1>Our Consultant</h1>
          <p>Seek expert IT consultation for your investment needs.</p>
        </div>

        <div className="filter-bar">
          <div className="filter-select">
            <select defaultValue="Position">
              <option disabled>Position</option>
              <option>UI/UX</option>
              <option>Front End Dev</option>
              <option>Back End</option>
              <option>Data Scientist</option>
              <option>AI Engineer</option>
              <option>ERP</option>
            </select>
          </div>
          <div className="filter-select">
            <select defaultValue="Price">
              <option disabled>Price</option>
              <option>Lowest Price</option>
              <option>Highest Price</option>
            </select>
          </div>
          <div className="filter-select">
            <select defaultValue="Rating">
              <option disabled>Rating</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
            </select>
          </div>
        </div>

        {loading && <p>Loading consultants...</p>}
        {error && <p style={{ color: "#b42318" }}>{error}</p>}

        {!loading && !error && (
          <div className="consult-grid">
            {items.map((item) => (
              <div className="consult-card" key={item.id}>
                <div className="card-image">
                  {getConsultantPhoto(item) && (
                    <img src={getConsultantPhoto(item)} alt={item.nama} className="img-preview-fill" />
                  )}
                </div>

                <div className="card-content">
                  <div className="card-header">
                    <h3>{item.nama}</h3>
                    <span className="rating">5.0</span>
                  </div>

                  <p className="role">{item.spesialisasi?.join(", ")}</p>
                  <p className="price">
                    {formatConsultantPrice(item)}
                  </p>

                  <button
                    className="btn-consult"
                    onClick={() => goToDetail(item.id)}
                  >
                    Consult Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
