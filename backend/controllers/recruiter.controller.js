import jwt from "jsonwebtoken";
import pdf from "pdf-parse";
import ollama from "ollama";
import fs from "fs";
import Opening from "../models/openings.model.js";
import Candidate from "../models/candidate.model.js";
import candidateMatch from "../models/candidateMatch.model.js";

const displayOpenings=async(req,res)=>{
    try{

        const token=req.headers.authorization.split(" ")[1];
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        const tasks=await Opening.find({recruiterList:decoded.id});


        return res.status(201).json({
            message: "success",tasks});

    }
    catch(e)
    {
        console.log(e);
        return res.status(400).json({message:e});
    }
}

const handleCandidate=async(req,res)=>{

    try{

       const token =
            req.headers.authorization?.split(" ")[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

         const buffer = fs.readFileSync(req.file.path);

        const result = await pdf(buffer);
        const resumeText = result.text;

        const prompt = `
            You are an expert Resume Parsing Engine.

            Your task is to analyze the resume and return ONLY a valid JSON object that exactly matches the schema below.

            ========================
            STRICT OUTPUT RULES
            ========================

            1. Return ONLY raw JSON.
            2. Do NOT return markdown.
            3. Do NOT return explanations.
            4. Do NOT return notes.
            5. Do NOT return comments.
            6. Do NOT return code blocks.
            7. Do NOT return any text before the JSON.
            8. Do NOT return any text after the JSON.
            9. The response must be directly parsable using JSON.parse().
            10. Follow the schema exactly.
            11. Never create additional fields.
            12. Never remove fields.
            13. Never rename fields.
            14. Every field must always exist.
            15. Missing values must follow datatype rules.
            16. Output only the JSON object.

            ========================
            FIELD RULES
            ========================

            name:
            - Candidate full name.
            - String if found.
            - Otherwise null.

            email:
            - Candidate email address.
            - String if found.
            - Otherwise null.

            seniority_level:
            - Must be exactly one of:
            "Junior"
            "Mid"
            "Senior"
            "Lead"
            - Determine from total experience.
            - If unclear:
            - 0-2 years => Junior
            - 3-5 years => Mid
            - 6-9 years => Senior
            - 10+ years => Lead

            experience_years:
            - Total professional experience.
            - Must be a number.
            - If unavailable, return 0.

            skills:
            - Include ALL technical skills.
            - Include ALL technologies.
            - Include ALL frameworks.
            - Include ALL databases.
            - Include ALL tools.
            - Include ALL cloud platforms.
            - Include ALL programming languages.
            - Do NOT limit the number of skills.
            - Remove duplicates.
            - If none found return [].

            ai_summary:
            - Generate a concise 2-3 sentence professional summary.
            - Mention major skills and experience.
            - If insufficient information exists return null.

            ========================
            IMPORTANT EXTRACTION RULES
            ========================

            - Extract ALL skills.
            - Do not summarize skill lists.
            - Do not select only top skills.
            - Preserve original skill names whenever possible.
            - Remove duplicate skills.
            - Do not invent skills.
            - Do not infer technologies not present in the resume.
            - Return valid JSON only.

            ========================
            REQUIRED JSON SCHEMA
            ========================

            {
            "name": null,
            "email": null,
            "seniority_level": "Junior",
            "experience_years": 0,
            "skills": [],
            "ai_summary": null
            }

            ========================
            RESUME
            ========================

            ${resumeText}
            `;

            const response=await ollama.chat(
                {
                     model: "llama3.2:3b",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                }
            );

            const candidateData = JSON.parse(
            response.message.content
        );

        const embeddingText = `
            Seniority Level:
            ${candidateData.seniorityLevel}

            Experience:
            ${candidateData.experienceYears} years

            Skills:
            ${candidateData.skills.join(", ")}

            Summary:
            ${candidateData.aiSummary}
            `;
                    
            const embeddingResponse =
            await ollama.embed({
                model: "embeddinggemma",
                input: embeddingText
            });

            const resumeEmbedding =
                embeddingResponse.embeddings[0];

          const candidate =
            await Candidate.create({
                name: candidateData.name,
                email: candidateData.email,

                seniorityLevel:
                    candidateData.seniorityLevel,

                experienceYears:
                    candidateData.experienceYears,

                skills:
                    candidateData.skills,

                resumeText,

                embeddingText,

                resumeEmbedding,

                aiSummary:
                    candidateData.aiSummary
            });
        

        fs.unlinkSync(req.file.path);
        res.status(201).json({candidate});

    }
    catch(err)
    {
        console.log(err);
        res.status(201).json({message:"error from recruiter controller"});
    }
};

const handleAnalyse = async (req,res)=>{

    function cosineSimilarity(vecA, vecB) {

    if (!vecA?.length || !vecB?.length) {
        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

    try{

        const {id,projectId} = req.body;

        const candidate =
            await Candidate.findById(id);
        
            const candidateName =
            await Candidate.findById(id).select("name");

        const opening =
            await Opening.findById(projectId);

        if(!candidate || !opening)
        {
            return res.status(404).json({
                message:"Data not found"
            });
        }

        const candidateSkills =
            candidate.skills.map(
                s => s.toLowerCase()
            );

        const mandatorySkills =
            opening.mandatorySkills.map(
                s => s.toLowerCase()
            );

        const preferredSkills =
            opening.preferredSkills.map(
                s => s.toLowerCase()
            );

        const matchedSkills =
            opening.mandatorySkills.filter(
                skill =>
                    candidateSkills.includes(
                        skill.toLowerCase()
                    )
            );

        const missingSkills =
            opening.mandatorySkills.filter(
                skill =>
                    !candidateSkills.includes(
                        skill.toLowerCase()
                    )
            );

        const matchedPreferredSkills =
            opening.preferredSkills.filter(
                skill =>
                    candidateSkills.includes(
                        skill.toLowerCase()
                    )
            );

        const missingPreferredSkills =
            opening.preferredSkills.filter(
                skill =>
                    !candidateSkills.includes(
                        skill.toLowerCase()
                    )
            );

        const skillScore =
            mandatorySkills.length === 0
            ? 100
            : (
                matchedSkills.length /
                mandatorySkills.length
              ) * 100;

        let experienceScore = 100;

        if(
            candidate.experienceYears <
            opening.experienceRequiredYears
        ){
            experienceScore =
                (
                    candidate.experienceYears /
                    opening.experienceRequiredYears
                ) * 100;
        }

        const semanticScore =
            cosineSimilarity(
                candidate.resumeEmbedding,
                opening.jdEmbedding
            ) * 100;

        const overallScore =
            (
                skillScore * 0.5 +
                experienceScore * 0.2 +
                semanticScore * 0.3
            );

        let recommendation;

        if(overallScore >= 75)
            recommendation =
                "Highly Recommended";

        else if(overallScore >= 60)
            recommendation =
                "Recommended";

        else if(overallScore >= 40)
            recommendation =
                "Consider";

        else
            recommendation =
                "Reject";

        const match =
            await candidateMatch.create({

                candidateId:id,

                candidateName:candidateName.name,

                openingId:projectId,

                matchedSkills,

                missingSkills,

                matchedPreferredSkills,

                missingPreferredSkills,

                skillScore:
                    Number(
                        skillScore.toFixed(2)
                    ),

                experienceScore:
                    Number(
                        experienceScore.toFixed(2)
                    ),

                semanticScore:
                    Number(
                        semanticScore.toFixed(2)
                    ),

                overallScore:
                    Number(
                        overallScore.toFixed(2)
                    ),

                recommendation,
                status: recommendation === "Reject" ? "Rejected" : "Pending"
            });

        return res.status(201).json({
            message:"success",
            match
        });

    }
    catch(err){

        console.log(err);

        return res.status(500).json({
            message:"analysis failed"
        });
    }
};

const getCandidates=async(req,res)=>{
    try{

            const id=req.query.projectId;
           
            const candidates = await candidateMatch.find({openingId:id}).select("candidateName status link");

            return res.status(200).json({
            candidates
        });

            
    }
    catch(err)
    {
        console.log(err);
    }
}

export {displayOpenings,handleCandidate,handleAnalyse,getCandidates}