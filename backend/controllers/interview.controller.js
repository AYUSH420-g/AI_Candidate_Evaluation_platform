import candidateMatch from "../models/candidateMatch.model.js";

const displayquestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.query;

    console.log("Interview Id:", id);
    console.log("Code:", code);

    const candidate = await candidateMatch.findOne({
      link_url: `${id}#${code}`
    });

    if (!candidate) {
      return res.status(404).json({
        message: "Interview not found"
      });
    }

    const questions = [
      ...candidate.Questions.easy,
      ...candidate.Questions.medium,
      ...candidate.Questions.hard
    ].map((q, index) => ({
      id: index + 1,
      _id:q._id,
      question: q.question,
      code: q.code,
      options: q.options,
      type: q.type,
      difficulty: q.difficulty
    }));

    return res.status(200).json({
      candidateName: candidate.candidateName,
      questions
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

const submitInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, code } = req.body;

    const candidate =
      await candidateMatch.findOne({
        link_url: `${id}#${code}`
      });

    if (!candidate) {
      return res
        .status(404)
        .json({ message: "Candidate not found" });
    }

    let score = 0;

    const allQuestions = [
      ...candidate.Questions.easy,
      ...candidate.Questions.medium,
      ...candidate.Questions.hard
    ];

    allQuestions.forEach((question) => {

      const selectedAnswer =
        answers[question._id.toString()];

      if (selectedAnswer) {
        question.selectedAnswer =
          selectedAnswer;

        if (
          selectedAnswer ===
          question.correctAnswer
        ) {
          score++;
        }
      }
    });

    candidate.testScore = score;
    candidate.totalQuestions = allQuestions.length;
    candidate.testSubmitted = true;

    await candidate.save();

    res.status(200).json({
      success: true,
      score,
      totalQuestions:
        allQuestions.length
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export { displayquestions,submitInterview };