import jwt from "jsonwebtoken";
import pdf from "pdf-parse";
import ollama from "ollama";
import fs from "fs";
import Opening from "../models/openings.model.js";
import Candidate from "../models/candidate.model.js";
import candidateMatch from "../models/candidateMatch.model.js";
import { evaluateResumeATS } from "../services/ats.service.js";

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

        const prompt =`You are an expert Resume Parsing Engine.

Extract information from the resume and return ONLY a valid JSON object.

RULES
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No comments.
- No code fences.
- No extra text.
- Output must be directly parsable using JSON.parse().
- Follow the schema exactly.
- Never add, remove, or rename fields.
- Every field must exist.

FIELDS

name
- Extract the candidate's full name.
- Return null if not found.

email
- Extract the primary email address.
- Return null if not found.

experience_years
- Calculate total professional experience.
- Return a number.
- Return 0 if unavailable.

seniority_level
Determine from experience_years only:
- 0-2 = Junior
- 3-5 = Mid
- 6-9 = Senior
- 10+ = Lead

skills
Extract ALL technical skills mentioned in the resume, including:
- Programming Languages
- Frameworks
- Libraries
- Databases
- Cloud Platforms
- DevOps Tools
- Testing Tools
- Version Control
- Build Tools
- APIs
- Technologies
- Software
- Platforms

Rules:
- Preserve original names.
- Remove duplicates.
- Never infer missing skills.
- Return [] if none.

Before responding:
- Ensure every field exists.
- experience_years must be a number.
- skills must be an array.
- Remove duplicate skills.
- Return valid JSON only.

Output Schema

{
  "name": null,
  "email": null,
  "seniority_level": "Junior",
  "experience_years": 0,
  "skills": []
}

Resume

${resumeText}
            `;

            const response=await ollama.chat(
                {
                     model: "llama3.1:8b",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    format: 'json'
                }
            );
            console.log(response);
            const candidateData = JSON.parse(
            response.message.content
        );

        const summaryPrompt = `
            You are a professional resume summary writer.

            Generate ONLY valid JSON.

            Rules:
            - Return ONLY JSON.
            - No markdown.
            - No explanations.
            - No extra text.

            Maximum 45 words.
            Write in third person.

            Use ONLY the information below.
            Never invent skills, projects, certifications or experience.

            Candidate:

            ${JSON.stringify(candidateData)}

            Return:

            {
            "ai_summary": "..."
            }
            `;

            const summaryResponse = await ollama.chat({
                model: "llama3.1:8b",
                messages: [
                    {
                        role: "user",
                        content: summaryPrompt
                    }
                ],
                format: "json"
            });

            const summaryData = JSON.parse(summaryResponse.message.content);
            candidateData.aiSummary = summaryData.ai_summary;

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
           
            const candidates = await candidateMatch.find({openingId:id}).select("candidateName status link link_url");

            return res.status(200).json({
            candidates
        });
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).json({ message: "Failed to get candidates" });
    }
};

const handleAtsCheck = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No resume PDF file uploaded" });
        }

        const filePath = req.file.path;
        let buffer;
        try {
            buffer = fs.readFileSync(filePath);
        } catch (readErr) {
            return res.status(400).json({ message: "Failed to read uploaded resume file" });
        }

        const pdfData = await pdf(buffer);
        const resumeText = pdfData?.text || "";

        if (!resumeText.trim()) {
            try { fs.unlinkSync(filePath); } catch (e) {}
            return res.status(400).json({
                message: "Unable to extract readable text from this PDF. Please ensure it is not scanned or an image-only document."
            });
        }

        const jobDescription = req.body?.jobDescription || "";
        const analysis = await evaluateResumeATS(resumeText, jobDescription);

        try {
            fs.unlinkSync(filePath);
        } catch (unlinkErr) {
            console.error("Error unlinking file:", unlinkErr);
        }

        return res.status(200).json({
            message: "success",
            analysis
        });
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        console.error("Error in handleAtsCheck:", error);
        return res.status(500).json({
            message: "ATS evaluation failed: " + (error.message || "Unknown error")
        });
    }
};

export {displayOpenings,handleCandidate,handleAnalyse,getCandidates,handleAtsCheck}