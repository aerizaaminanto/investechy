import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SidebarAdmin from "./admsidebar";
import { usePopup } from "../components/PopupProvider";
import { deleteConsultant, fetchConsultants } from "../store/consultantThunk";
import { useAdminPageTransition } from "./useAdminPageTransition";
import "./adminTransitions.css";
import "./consultant.css";

const getConsultantId = (consultant) => consultant?.id ?? consultant?._id;

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
  return price === null ? "Fee not set" : `IDR. ${price.toLocaleString("id-ID")} / Session`;
};

const ConsultantPage = () => {
  const dispatch = useDispatch();
  const popup = usePopup();
  const { transitionClassName, navigateWithTransition } = useAdminPageTransition();
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [alphabetFilter, setAlphabetFilter] = useState("A_TO_Z");
  const [feeFilter, setFeeFilter] = useState("DEFAULT");

  const { items, loading, deleting, error } = useSelector((state) => state.consultant);

  useEffect(() => {
    dispatch(fetchConsultants());
  }, [dispatch]);

  const handleDelete = async (id) => {
    const isConfirmed = await popup.confirm({
      title: { id: "Hapus Konsultan", en: "Delete Consultant" },
      message: {
        id: "Hapus data konsultan ini dari direktori admin?",
        en: "Delete this consultant's data from the admin directory?",
      },
      confirmText: { id: "Hapus", en: "Delete" },
      cancelText: { id: "Simpan", en: "Keep" },
      tone: "danger",
    });

    if (!isConfirmed) return;

    await dispatch(deleteConsultant(id));
    popup.notify({
      title: { id: "Konsultan Dihapus", en: "Consultant Removed" },
      message: {
        id: "Data konsultan berhasil dihapus dari direktori.",
        en: "The consultant data has been removed from the directory.",
      },
    });
  };

  const availablePositions = useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((consultant) =>
            Array.isArray(consultant?.spesialisasi)
              ? consultant.spesialisasi
              : consultant?.spesialisasi
                ? [consultant.spesialisasi]
                : [],
          ),
        ),
      )
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const filteredConsultants = useMemo(() => {
    const nextItems = [...items];

    const positionMatchedItems =
      positionFilter === "ALL"
        ? nextItems
        : nextItems.filter((consultant) => {
            const positions = Array.isArray(consultant?.spesialisasi)
              ? consultant.spesialisasi
              : consultant?.spesialisasi
                ? [consultant.spesialisasi]
                : [];

            return positions.includes(positionFilter);
          });

    positionMatchedItems.sort((leftItem, rightItem) => {
      const leftName = leftItem?.nama || "";
      const rightName = rightItem?.nama || "";

      if (alphabetFilter === "Z_TO_A") {
        return rightName.localeCompare(leftName);
      }

      return leftName.localeCompare(rightName);
    });

    if (feeFilter === "LOW_TO_HIGH" || feeFilter === "HIGH_TO_LOW") {
      positionMatchedItems.sort((leftItem, rightItem) => {
        const leftPrice = getConsultantPrice(leftItem) ?? Number.POSITIVE_INFINITY;
        const rightPrice = getConsultantPrice(rightItem) ?? Number.POSITIVE_INFINITY;

        return feeFilter === "LOW_TO_HIGH" ? leftPrice - rightPrice : rightPrice - leftPrice;
      });
    }

    return positionMatchedItems;
  }, [alphabetFilter, feeFilter, items, positionFilter]);

  return (
    <div className="admin-page-layout">
      <SidebarAdmin activeMenu="Consultant" />
      <main className={`admin-content-area ${transitionClassName}`}>
        <div className="admin-filter-bar">
          <div className="admin-filter-select">
            <select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}>
              <option value="ALL">All Positions</option>
              {availablePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter-select">
            <select value={feeFilter} onChange={(event) => setFeeFilter(event.target.value)}>
              <option value="DEFAULT">Fee</option>
              <option value="LOW_TO_HIGH">Lowest Fee</option>
              <option value="HIGH_TO_LOW">Highest Fee</option>
            </select>
          </div>
          <div className="admin-filter-select">
            <select value={alphabetFilter} onChange={(event) => setAlphabetFilter(event.target.value)}>
              <option value="A_TO_Z">A-Z</option>
              <option value="Z_TO_A">Z-A</option>
            </select>
          </div>
        </div>

        <div className="top-button-container">
          <button className="add-consultant-btn" onClick={() => navigateWithTransition("/admin/consultant/form")}>
            + Add New IT Consultant
          </button>
        </div>

        {loading && <p>Loading data consultants...</p>}
        {error && <p style={{ color: "#b42318" }}>Error: {error}</p>}

        {!loading && !error && (
          <div className="consultant-cards-grid">
            {filteredConsultants.map((item) => (
              <div key={getConsultantId(item)} className="consultant-item-card">
                <div className="item-card-image">
                  {getConsultantPhoto(item) && (
                    <img src={getConsultantPhoto(item)} alt={item.nama} className="img-preview-fill" />
                  )}
                </div>

                <div className="item-card-details">
                  <div className="item-card-header">
                    <h4 className="item-name">{item.nama}</h4>
                    <span className="item-rating">5.0</span>
                  </div>

                  <p className="item-role">
                    {Array.isArray(item.spesialisasi) ? item.spesialisasi.join(", ") : item.spesialisasi}
                  </p>

                  <p className="item-price">{formatConsultantPrice(item)}</p>

                  <div className="item-card-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => navigateWithTransition(`/admin/consultant/form/${getConsultantId(item)}`)}
                    >
                      <img src="https://img.icons8.com/?size=100&id=H5dKJanZkZNk&format=png&color=00381e" alt="edit" />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(getConsultantId(item))}
                      disabled={deleting}
                    >
                      <img src="https://img.icons8.com/?size=100&id=7DbfyX80LGwU&format=png&color=C80000" alt="delete" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredConsultants.length === 0 && (
              <div className="admin-consultant-empty-state">No consultants match the selected filters.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConsultantPage;
