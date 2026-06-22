import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Interview() {
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [candidateName, setCandidateName] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const code = window.location.hash.slice(1);
      const res = await axios.post(
        `http://localhost:5010/interview/${id}/submit`,
        {
          answers,
          code
        }
      );

      setResult({
        score: res.data.score,
        totalQuestions: res.data.totalQuestions
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const code = window.location.hash.slice(1);

    if (!code) return;

    const loadQuestions = async () => {
      try {
        localStorage.clear();
        const res = await axios.get(
          `http://localhost:5010/interview/${id}`,
          {
            params: { code }
          }
        );

        setQuestions(res.data.questions);
        setCandidateName(res.data.candidateName);
      } catch (err) {
        console.error(err);
      }
    };

    loadQuestions();
  }, [id]);

  const handleAnswer = (_id, option) => {
    setAnswers((prev) => ({
      ...prev,
      [_id]: option
    }));
  };

  // Show result screen after submission
  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const isPassed = percentage >= 50;

    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "60px auto",
          padding: "40px",
          textAlign: "center",
          borderRadius: "16px",
          background: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)"
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: isPassed
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "linear-gradient(135deg, #ef4444, #dc2626)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color: "#fff",
            fontSize: "32px",
            fontWeight: "bold"
          }}
        >
          {percentage}%
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "8px"
          }}
        >
          Test Completed!
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#6b7280",
            marginBottom: "24px"
          }}
        >
          Thank you, <strong>{candidateName}</strong>
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            marginBottom: "24px"
          }}
        >
          <div>
            <p
              style={{
                fontSize: "14px",
                color: "#9ca3af",
                marginBottom: "4px"
              }}
            >
              Score
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#1f2937"
              }}
            >
              {result.score} / {result.totalQuestions}
            </p>
          </div>

          <div
            style={{
              width: "1px",
              background: "#e5e7eb"
            }}
          />

          <div>
            <p
              style={{
                fontSize: "14px",
                color: "#9ca3af",
                marginBottom: "4px"
              }}
            >
              Result
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: isPassed ? "#10b981" : "#ef4444"
              }}
            >
              {isPassed ? "Passed" : "Failed"}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "16px",
            color: "#6b7280",
            fontSize: "14px"
          }}
        >
          Your results have been saved. You may close this window.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
        padding: "20px"
      }}
    >
      <h1>Interview Test</h1>

      <h3>{candidateName}</h3>

      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px"
          }}
        >
          <h3>
            {q.id}. {q.question}
          </h3>

          {q.code && (
            <pre
              style={{
                background: "#f5f5f5",
                padding: "10px"
              }}
            >
              {q.code}
            </pre>
          )}

          <div>
            {["A", "B", "C", "D"].map((option) => (
              <label
                key={option}
                style={{
                  display: "block",
                  marginBottom: "8px"
                }}
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={option}
                  disabled={submitting}
                  onChange={() =>
                    handleAnswer(q._id, option)
                  }
                />

                {" "}
                {option}. {q.options?.[option]}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          padding: "12px 32px",
          fontSize: "16px",
          fontWeight: "600",
          color: "#fff",
          background: submitting ? "#9ca3af" : "#2563eb",
          border: "none",
          borderRadius: "8px",
          cursor: submitting ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        {submitting && (
          <span
            style={{
              display: "inline-block",
              width: "16px",
              height: "16px",
              border: "2px solid #fff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite"
            }}
          />
        )}
        {submitting ? "Submitting..." : "Submit"}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Interview;