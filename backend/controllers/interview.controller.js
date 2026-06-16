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

export { displayquestions };