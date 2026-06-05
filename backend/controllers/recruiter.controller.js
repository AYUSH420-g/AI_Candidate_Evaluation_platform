import jwt from "jsonwebtoken";
import * as pdfParse from "pdf-parse";
import ollama from "ollama";
import fs from "fs";
import candidateDetails from "../models/candidateDetails.model.js";

const displayOpenings=async(req,res)=>{
    try{
        const token=req.headers.authorization.split(" ")[1];

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        // console.log(decoded.id);

        const tasks=await projectDetails.find({recruiterList:decoded.id});


        console.log(pdfParse);
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

        const {recruiterId,adminId,candidateName,candidateEmail,projectId}=req.body;
        
        const decoded = jwt.verify(recruiterId, process.env.JWT_SECRET);

         const buffer = fs.readFileSync(req.file.path);

        const parser = new pdfParse.PDFParse({ data: buffer });

        const result = await parser.getText();
        const resumeText = result.text;

        // console.log(resumeText);
        
        const query = {
            recruiterId: decoded.id,
            adminId,
            candidateName,
            candidateEmail,
            projectId,
            candidateCv: req.file.path,
            resumeText
        };      
        

        const q=await candidateDetails.create(query);
        fs.unlinkSync(req.file.path);
        res.status(201).json({data:q});

    }
    catch(err)
    {
        console.log(err);
        res.status(201).json({message:"error from recruiter controller"});
    }
};

const handleAnalyse=async(req,res)=>{
        console.log("Analyse API hit");
        try{
            const {id,projectId}=req.body;

            const jd=await projectDetails.find({_id:projectId},{jobDescription:1});
            const cv=await candidateDetails.find({_id:id},{resumeText:1});
            // console.log(jd[0].jobDescription);
            // console.log(cv[0].resumeText);
            // return res.status(201).json({message:"successful"});

            const prompt = `
                You are a strict ATS (Applicant Tracking System).

                JOB DESCRIPTION:
                ${jd[0].jobDescription}

                RESUME:
                ${cv[0].resumeText}

                TASK:
                Compare the resume against the job description.

                SCORING RULES:
                - Score 9-10: Candidate matches almost all required skills and experience.
                - Score 7-8: Candidate matches most required skills.
                - Score 5-6: Candidate matches some skills but has important gaps.
                - Score 1-4: Candidate lacks most required skills or experience.

                STATUS RULE:
                - Pass if score >= 7
                - Fail if score < 7

                IMPORTANT:
                - Be strict.
                - Do not be generous.
                - If the resume is unrelated to the job description, give a score between 1 and 3.
                - If required technologies are missing, reduce the score significantly.
                - Base the decision only on information present in the resume.

                Return ONLY valid JSON:

                {
                "score": 0,
                "status": "",
                "summary": ""
                }

                Do not return markdown.
                Do not return explanations.
                Do not return text before or after the JSON.
                `;

                console.log("Before Ollama");
            const response=await ollama.chat(
                {
                    model:"llama3.2:3b",
                    messages:[
                        {
                        role:"user",
                        content: prompt
                        }

                    ]

                }
            );
            console.log("after Ollama");
            console.log(response);
            // console.log(prompt);
            return res.status(201).json({message:"ok"});

            
        }
        catch(err)
        {
            console.log(err);
        }
};

export {displayOpenings,handleCandidate,handleAnalyse}