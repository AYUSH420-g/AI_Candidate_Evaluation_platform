import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TIMER_DURATION = 10 * 60; 

function Interview() {
  const { id } = useParams();
  const [phase, setPhase] = useState("loading"); 
  const [questions, setQuestions] = useState([]);
  const [candidateName, setCandidateName] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (phase !== "quiz") return;

    const preventCopyPaste = (e) => {
      e.preventDefault();
      alert("Copy, paste, cut and right-click are disabled during the test.");
    };

    const handleViolation = () => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      handleSubmit();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleViolation);

    return () => {
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleViolation);
    };
  }, [phase]); 

  useEffect(() => {
    if (phase !== "quiz") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!submittedRef.current) {
            submittedRef.current = true;
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]); 

  useEffect(() => {
    const code = window.location.hash.slice(1);
    if (!code) {
      setPhase("rules"); 
      return;
    }

    const loadQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5010/interview/${id}`, {
          params: { code },
        });

        setCandidateName(res.data.candidateName);

        if (res.data.testSubmitted) {
          setResult({
            score: res.data.score,
            totalQuestions: res.data.totalQuestions,
          });
          setPhase("result");
        } else {
          setQuestions(res.data.questions);
          setPhase("rules");
        }
      } catch (err) {
        console.error(err);
        setPhase("rules");
      }
    };

    loadQuestions();
  }, [id]);

  const handleSubmit = async (currentAnswers) => {
    clearInterval(timerRef.current);
    const answersToSend = currentAnswers ?? answers;

    try {
      setSubmitting(true);
      const code = window.location.hash.slice(1);
      const res = await axios.post(
        `http://localhost:5010/interview/${id}/submit`,
        { answers: answersToSend, code }
      );
      setResult({
        score: res.data.score,
        totalQuestions: res.data.totalQuestions,
      });
      setPhase("result");
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Last question — submit
      if (!submittedRef.current) {
        submittedRef.current = true;
        handleSubmit();
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (phase === "loading") {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: "#6b7280", marginTop: 16 }}>Loading your test…</p>
        <style>{spinnerCSS}</style>
      </div>
    );
  }


  if (phase === "rules") {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <span style={styles.lockIcon}>🔒</span>
            <h1 style={styles.modalTitle}>Online Assessment</h1>
            {candidateName && (
              <p style={styles.modalSub}>
                Welcome, <strong>{candidateName}</strong>
              </p>
            )}
          </div>

          <div style={styles.rulesBox}>
            <p style={styles.rulesHeading}>Please read before you begin</p>
            <ul style={styles.rulesList}>
              {[
                "You have 10 minutes to complete the test.",
                "Each question is shown one at a time. You cannot go back.",
                "Do not switch tabs or minimize the window — this will auto-submit your test.",
                "Copy, paste, and cut are disabled during the test.",
                "Once submitted, you cannot retake the test.",
                "Answer every question before clicking Next.",
              ].map((rule, i) => (
                <li key={i} style={styles.ruleItem}>
                  <span style={styles.ruleBullet}>{i + 1}</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <button
            style={styles.startBtn}
            onClick={() => {
              setTimeLeft(TIMER_DURATION);
              setCurrentIndex(0);
              setPhase("quiz");
            }}
          >
            Start Test →
          </button>
        </div>
      </div>
    );
  }

  
  if (phase === "quiz") {
    const q = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const selectedOption = answers[q?._id];
    const timerDanger = timeLeft <= 60;

    return (
      <div style={styles.quizPage}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <span style={styles.progressLabel}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div
            style={{
              ...styles.timer,
              color: timerDanger ? "#dc2626" : "#1f2937",
              border: `2px solid ${timerDanger ? "#dc2626" : "#d1d5db"}`,
            }}
          >
             {formatTime(timeLeft)}
          </div>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div style={styles.questionCard}>
          <p style={styles.questionText}>
            {currentIndex + 1}. {q?.question}
          </p>

          {q?.code && (
            <pre style={styles.codeBlock}>{
              typeof q.code === "string" ? q.code.replace(/\\n/g, '\n') : JSON.stringify(q.code, null, 2)
            }</pre>
          )}

          <div style={styles.optionsGrid}>
            {["A", "B", "C", "D"].map((opt) => (
              <label
                key={opt}
                style={{
                  ...styles.optionLabel,
                  background:
                    selectedOption === opt ? "#eff6ff" : "#fff",
                  borderColor:
                    selectedOption === opt ? "#2563eb" : "#e5e7eb",
                  color:
                    selectedOption === opt ? "#1d4ed8" : "#1f2937",
                }}
              >
                <input
                  type="radio"
                  name={`q-${q?._id}`}
                  value={opt}
                  checked={selectedOption === opt}
                  disabled={submitting}
                  onChange={() => handleAnswer(q._id, opt)}
                  style={{ accentColor: "#2563eb" }}
                />
                <span style={styles.optionKey}>{opt}</span>
                <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {typeof q?.options?.[opt] === "string" ? q?.options?.[opt].replace(/\\n/g, '\n') : JSON.stringify(q?.options?.[opt])}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <button
            onClick={handleNext}
            disabled={submitting || !selectedOption}
            style={{
              ...styles.nextBtn,
              opacity: !selectedOption || submitting ? 0.5 : 1,
              cursor: !selectedOption || submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? (
              <>
                <span style={styles.spinnerSmall} /> Submitting…
              </>
            ) : isLast ? (
              "Submit Test ✓"
            ) : (
              "Next →"
            )}
          </button>
        </div>

        <style>{spinnerCSS}</style>
      </div>
    );
  }

  if (phase === "result" && result) {
    const percentage = Math.round(
      (result.score / result.totalQuestions) * 100
    );
    const isPassed = percentage >= 50;

    return (
      <div style={styles.overlay}>
        <div style={{ ...styles.modal, textAlign: "center" }}>
          <div
            style={{
              ...styles.scoreCircle,
              background: isPassed
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
            }}
          >
            {percentage}%
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "16px 0 6px" }}>
            Test Completed!
          </h1>
          {candidateName && (
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
              Thank you, <strong>{candidateName}</strong>
            </p>
          )}

          <div style={styles.resultRow}>
            <div>
              <p style={styles.resultLabel}>Score</p>
              <p style={styles.resultValue}>
                {result.score} / {result.totalQuestions}
              </p>
            </div>
            <div style={{ width: 1, background: "#e5e7eb" }} />
            <div>
              <p style={styles.resultLabel}>Result</p>
              <p
                style={{
                  ...styles.resultValue,
                  color: isPassed ? "#10b981" : "#ef4444",
                }}
              >
                {isPassed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>

          <div style={styles.closeBanner}>
            Your results have been saved. You may close this window.
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  spinnerSmall: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    marginRight: 6,
  },
  overlay: {
    minHeight: "100vh",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: "36px 32px",
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  },
  modalHeader: {
    textAlign: "center",
    marginBottom: 24,
  },
  lockIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1f2937",
    margin: "8px 0 4px",
  },
  modalSub: {
    color: "#6b7280",
    fontSize: 15,
    margin: 0,
  },
  rulesBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 24,
  },
  rulesHeading: {
    fontWeight: 600,
    color: "#374151",
    marginBottom: 12,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  rulesList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  ruleItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.5,
  },
  ruleBullet: {
    minWidth: 22,
    height: 22,
    background: "#2563eb",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  startBtn: {
    width: "100%",
    padding: "14px",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    background: "#2563eb",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  quizPage: {
    maxWidth: 720,
    margin: "32px auto",
    padding: "0 20px 40px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
  },
  timer: {
    fontSize: 16,
    fontWeight: 700,
    padding: "6px 14px",
    borderRadius: 8,
    transition: "color 0.3s, border-color 0.3s",
  },
  progressTrack: {
    height: 6,
    background: "#e5e7eb",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  questionCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "28px 28px 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  questionText: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1f2937",
    lineHeight: 1.55,
    marginBottom: 16,
  },
  codeBlock: {
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 13,
    fontFamily: "monospace",
    overflowX: "auto",
    marginBottom: 16,
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  optionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    border: "1.5px solid",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 15,
    transition: "all 0.15s",
    userSelect: "none",
  },
  optionKey: {
    fontWeight: 700,
    minWidth: 20,
  },
  nextBtn: {
    padding: "12px 32px",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    background: "#2563eb",
    border: "none",
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    transition: "opacity 0.2s",
  },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 8px",
    color: "#fff",
    fontSize: 28,
    fontWeight: 800,
  },
  resultRow: {
    display: "flex",
    justifyContent: "center",
    gap: 32,
    margin: "0 0 24px",
  },
  resultLabel: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  closeBanner: {
    background: "#f9fafb",
    borderRadius: 10,
    padding: "14px 16px",
    color: "#6b7280",
    fontSize: 14,
  },
};

const spinnerCSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default Interview;