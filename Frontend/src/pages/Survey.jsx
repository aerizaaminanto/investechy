import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar.jsx";
import { usePopup } from "../components/PopupProvider";
import { createProject } from "../store/projectThunk";
import { getProjectId } from "../services/projectNormalizer";
import "../components/pages.css";

const Survey = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const popup = usePopup();
  const { loading, error } = useSelector((state) => state.project);

  useEffect(() => {
    document.body.classList.remove("page-exit"); 
  }, []);

  const [answers, setAnswers] = useState({});

  const surveySections = [
    {
      category: "Business Domain",
      questions: [
        {
          id: "bd_q1",
          text: "How does this investment link to your business goals?",
          options: [
            "This investment isn't directly linked to your goals.",
            "It doesn't directly hit your goals, but it will definitely make your operations run smoother.",
            "This isn't a direct goal-hitter, but it's a 'must-have' for other systems to reach your goals.",
            "This doesn't directly reach your goals, but it's a necessary foundation for other systems to hit those strategic targets.",
            "This investment directly helps achieve some of your goals.",
            "This investment directly hits all of your set goals."
          ]
        },
        {
          id: "bd_q2",
          text: "Does this investment create data sharing between stakeholders?",
          options: [
            "This investment doesn't create any data sharing or access between your stakeholders, employees, or departments.",
            "There's no data sharing involved here, but it boosts your competitive edge by making your operations much more efficient across the board.",
            "This doesn't create data access, but it strengthens your competitive position by improving work efficiency.",
            "This investment offers some external data sharing and provides a decent boost to your competitive standing.",
            "This investment provides plenty of data access and substantially boosts your competitive edge by offering better service than your rivals.",
            "This provides extensive data access and significantly puts you ahead of the competition by offering services they simply don't have."
          ]
        },
        {
          id: "bd_q3",
          text: "Management Information Support",
          options: [
            "This investment doesn't provide management information support for your core business activities.",
            "It isn't related to your main operations, but it provides plenty of data for the functions that support your core business.",
            "This isn't for your main activities, but it provides a lot of information for the departments that directly support your core operations.",
            "While not directly related to your main activities, it provides essential operational info for your company's core functions.",
            "This investment is key to providing the management info you'll need for your core activities in the future.",
            "This investment is crucial for supporting your core activities with the management information you need right now."
          ]
        },
        {
          id: "bd_q4",
          text: "Investment Delay Risk",
          options: [
            "You can delay this investment for up to 12 months without affecting your competitive edge.",
            "Delaying this investment won't hurt your competitive standing, and low labor costs are expected.",
            "Delaying this won't impact your competitive position, but labor costs might rise.",
            "If delayed, you can still respond to changes effectively without losing your competitive edge.",
            "Delaying this investment could put you at a competitive disadvantage or limit the success of your current activities.",
            "Delaying this will result in future competitive losses or missed opportunities."
          ]
        },
        {
          id: "bd_q5",
          text: "Documented Processes & Contingency",
          options: [
            "This investment has a well-formulated plan to implement systems that match your current processes.",
            "This investment supports your future management processes and ensures you have solid contingency plans.",
            "This investment doesn't quite fit your current processes yet, but it provides good contingency planning.",
            "The processes aren't fully ready for your needs yet, but it does support contingency plans.",
            "This investment lacks documented processes and contingency plans, but it still clearly defines some products.",
            "This investment lacks proper documented processes and provides no contingency plans."
          ]
        }
      ]
    },
    {
      category: "Technology Domain",
      questions: [
        {
          id: "td_q1",
          text: "How does this system align with the technology you have now and where you want to go in the future?",
          options: [
            "Not aligned at all; it's isolated and creates integration issues.",
            "Poorly aligned; it requires a lot of workarounds to get everything connected.",
            "Fairly aligned, though there are still some limitations when it comes to integration.",
            "Well-aligned with your current architecture.",
            "Highly aligned; it supports your current architecture and is easy to scale up in the future.",
            "Perfectly aligned; it serves as a strategic pillar for your architecture and is completely future-proof."
          ]
        },
        {
          id: "td_q2",
          text: "How clear and complete were the requirements and scope for this system before the project started?",
          options: [
            "Very unclear – Requirements were vague and the scope kept changing.",
            "Unclear – There were too many assumptions and changes throughout the project.",
            "Somewhat clear – Core requirements were defined, but details were missing.",
            "Mostly clear – Most requirements and the scope were well-defined.",
            "Clear – Requirements and scope were defined in detail.",
            "Very clear – Everything was detailed, documented, and understood by everyone."
          ]
        },
        {
          id: "td_q3",
          text: "How low was the level of technical risk or uncertainty during implementation?",
          options: [
            "Very High Risk – The technology was new or unproven.",
            "High Risk – The technology was risky, and several significant technical problems occurred.",
            "Medium Risk – There were some technical challenges, but they were manageable.",
            "Fairly Low Risk – The technology was mature, with only minor technical challenges.",
            "Low Risk – The technology is proven and reliable; implementation went smoothly.",
            "Very Low Risk – The technology is highly stable and mature."
          ]
        },
        {
          id: "td_q4",
          text: "How low was the risk this system posed to your existing IT infrastructure?",
          options: [
            "Very High Risk – It strained the infrastructure and posed high security risks.",
            "High Risk – Significant infrastructure adjustments were needed.",
            "Medium Risk – Some minor adjustments were required.",
            "Fairly Low Risk – It runs on existing infrastructure with only minor adjustments.",
            "Low Risk – It runs smoothly on existing infrastructure with minimal risk.",
            "Very Low Risk – It integrates perfectly without straining the system."
          ]
        }
      ]
    },
    {
      category: "Current & Future IT Impact",
      questions: [
        {
          id: "cit_q1",
          text: "How digitally are business transactions conducted?",
          options: ["Not digital", "Partially digital", "About half digital", "Mostly digital", "Fully digital"]
        },
        {
          id: "cit_q2",
          text: "Impact if IT systems experience downtime",
          options: ["No impact", "Minor impact", "Partial disruption", "Significant disruption", "Complete operational halt"]
        },
        {
          id: "fit_q1",
          text: "Role of IT in business expansion",
          options: ["Not required", "Low importance", "Moderately important", "Important", "Critically important"]
        },
        {
          id: "fit_q2",
          text: "IT's potential as a competitive advantage",
          options: ["None", "Low", "Medium", "High", "Very high"]
        }
      ]
    },
    {
      category: "Digital Maturity",
      questions: [
        {
          id: "dm_q1",
          text: "Which statement best describes your current business state?",
          options: [
            "Processes are still manual",
            "Using basic digital tools",
            "Utilizing business systems (ERP/CRM)",
            "Integrated systems in place",
            "Data-driven with analytics / AI"
          ]
        }
      ]
    },
    {
      category: "Risk Exposure",
      questions: [
        {
          id: "re_q1",
          text: "Risk of system disruption (downtime)",
          options: ["None", "Low", "Medium", "High", "Very high"]
        },
        {
          id: "re_q2",
          text: "Risk of data loss or corruption",
          options: ["None", "Low", "Medium", "High", "Very high"]
        },
        {
          id: "re_q3",
          text: "Risk of system security breaches (cybersecurity)",
          options: ["None", "Low", "Medium", "High", "Very high"]
        }
      ]
    }
  ];

  const calculateValue = (index, totalOptions) => {
    return totalOptions === 6 ? index : index + 1;
  };

  const handleRadioChange = (qId, score) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  const buildProjectPayload = () => {
    const baseData = JSON.parse(sessionStorage.getItem("temp_project_base") || "{}");

    return {
      projectName: baseData.projectName,
      industry: baseData.businessSector,
      employeeCount: Number(baseData.employeeCount),
      plan: baseData.investmentType,
      location: baseData.location,
      businessDomain: {
        SM: answers.bd_q1,
        CA: answers.bd_q2,
        MI: answers.bd_q3,
        CR: answers.bd_q4,
        OR: answers.bd_q5,
      },
      technologyDomain: {
        SA: answers.td_q1,
        DU: answers.td_q2,
        TU: answers.td_q3,
        IR: answers.td_q4,
      },
      currentIT: [answers.cit_q1, answers.cit_q2],
      futureIT: [answers.fit_q1, answers.fit_q2],
      DM: [answers.dm_q1],
      RE: [answers.re_q1, answers.re_q2, answers.re_q3],
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = buildProjectPayload();
    const isConfirmed = await popup.confirm({
      title: { id: "Kirim Analisis", en: "Submit Analysis" },
      message: {
        id: "Apakah Anda yakin ingin mengirim analisis ini?",
        en: "Are you sure you want to submit this analysis?",
      },
      confirmText: { id: "Kirim Sekarang", en: "Submit Now" },
      cancelText: { id: "Periksa Lagi", en: "Review Again" },
    });

    if (isConfirmed) {
      const resultAction = await dispatch(createProject(payload));

      if (createProject.fulfilled.match(resultAction)) {
        const createdProject = resultAction.payload?.data || resultAction.payload;
        const projectId = getProjectId(createdProject);
        if (projectId) {
          sessionStorage.setItem("investechy_latest_project_id", projectId);
        }
        sessionStorage.removeItem("temp_project_base");
        popup.notify({
          title: { id: "Analisis Dikirim", en: "Analysis Submitted" },
          message: {
            id: "Project baru berhasil dibuat dan masuk ke daftar project.",
            en: "The new project was created successfully and added to the project list.",
          },
        });
        navigate("/project-list");
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu="New Project" />
      <main className="main-content">
        <h1 className="page-title">Survey</h1>
        <p className="page-subtitle">Answer these questions for a complete IT investment analysis</p>

        <form onSubmit={handleSubmit}>
          {surveySections.map((section) => (
            <div key={section.category} className="survey-section-group">
              <h2 className="survey-section-title">{section.category}</h2>
              {section.questions.map((q) => (
                <div key={q.id} className="survey-card">
                  <label className="question-label">{q.text}</label>
                  <div className="options-list">
                    {q.options.map((opt, i) => {
                      const finalValue = calculateValue(i, q.options.length);
                      return (
                        <label key={i} className="option-label">
                          <input
                            type="radio"
                            name={q.id}
                            required
                            checked={answers[q.id] === finalValue}
                            onChange={() => handleRadioChange(q.id, finalValue)}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="button-container">
            {error && (
              <p style={{ color: "#b42318", marginBottom: "12px" }}>{error}</p>
            )}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Survey;
