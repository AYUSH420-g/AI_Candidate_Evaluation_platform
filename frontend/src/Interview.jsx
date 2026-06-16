import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Interview() {
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [candidateName, setCandidateName] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const code = window.location.hash.slice(1);

    if (!code) return;

    const loadQuestions = async () => {
      try {
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

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

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
                  onChange={() =>
                    handleAnswer(q.id, option)
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
        onClick={() => console.log(answers)}
      >
        Submit
      </button>
    </div>
  );
}

export default Interview;