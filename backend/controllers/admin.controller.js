import Opening from "../models/openings.model.js";
import User from "../models/user.model.js";
// import candidateDetails from "../models/candidateDetails.model.js";
import jwt from "jsonwebtoken";
import pdf from "pdf-parse";
import ollama from "ollama";
import candidateMatch from "../models/candidateMatch.model.js";
const searchQuery=async(req,res)=>{

    try{

        const [name]=req.query.name;
        const query={Role:"recruiter"}

        if(name)
        {
            query.Name={$regex: name, $options: "i"}
        }

        const recruiters = await User.find(query).select("Name Email");
        return res.status(201).json({recruiters:recruiters});

    }
    catch(e)
    {
        console.log(e);
        return res.status(400).json({message:"error from admin contoller"});
    }

};

const storeDetails=async(req,res)=>{

    try{

        const {projectName, listOfRecruiters, token}=req.body;
        const list = JSON.parse(req.body.listOfRecruiters);
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
       
        const data=await pdf(req.file.buffer);
        // console.log(data.text);
        
        
        // const q=await projectDetails.create(query);
        //  res.status(201).json({data:q});
        const prompt = `
            You are an expert HR Job Description Parsing Engine.

            Your task is to analyze the Job Description and return ONLY a valid JSON object that exactly matches the schema provided below.

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
            10. The schema below is mandatory and must be followed exactly.
            11. Never create additional fields.
            12. Never remove fields.
            13. Never rename fields.
            14. Every field must always be present in the output.
            15. Missing values must be represented according to their datatype rules below.
            16. Do not include fields that are not defined in the schema.
            17. Do not explain why a field is empty.
            18. Do not write phrases such as:
            - "Not found"
            - "Not mentioned"
            - "No information available"
            - "Excluded because..."
            - "I could not find..."
            19. Output only the JSON object.

            ========================
            FIELD RULES
            ========================

            job_title:
            - String if found.
            - Otherwise null.

            seniority_level:
            - Must be exactly one of:
            "Junior"
            "Mid"
            "Senior"
            "Lead"
            - If no experience or seniority information is found, set to "Junior".

            experience_required_years:
            - Must be a number.
            - If not explicitly mentioned, set to null.

            mandatory_skills:
            - Include ALL mandatory skills.
            - Include ALL required technologies.
            - Include ALL required frameworks.
            - Include ALL required tools.
            - Include ALL required platforms.
            - Include ALL required qualifications.
            - Do NOT limit the number of skills.
            - If none found, return [].

            preferred_skills:
            - Include ALL skills marked as:
            preferred,
            desired,
            optional,
            bonus,
            plus,
            good to have,
            nice to have,
            advantageous.
            - Do NOT limit the number of skills.
            - If none found, return [].

            soft_skills:
            - Include all soft skills explicitly mentioned.
            - Examples:
            Communication,
            Leadership,
            Teamwork,
            Problem Solving,
            Time Management,
            Adaptability,
            Critical Thinking.
            - If none found, return [].

            brief_summary:
            - Generate a concise 2-3 sentence role summary.
            - If insufficient information exists, return null.

            ========================
            IMPORTANT EXTRACTION RULES
            ========================

            - Extract ALL skills mentioned.
            - Do not summarize skill lists.
            - Do not select only top skills.
            - If 30 skills exist, return all 30.
            - Preserve skill names as written whenever possible.
            - Do not infer technologies that are not mentioned.
            - Separate mandatory and preferred skills correctly.
            - Good To Have skills MUST go into preferred_skills.
            - Never omit a field because data is missing.
            - Empty arrays are required for array fields when no data exists.
            - Null is required for scalar fields when no data exists.

            ========================
            REQUIRED JSON SCHEMA
            ========================

            {
            "job_title": null,
            "seniority_level": "Junior",
            "experience_required_years": null,
            "mandatory_skills": [],
            "preferred_skills": [],
            "soft_skills": [],
            "brief_summary": null
            }

            ========================
            JOB DESCRIPTION
            ========================

            ${data.text}
            `;
            const response=await ollama.chat({

                model:"llama3.2:3b",
                messages:[
                        {
                        role:"user",
                        content: prompt
                        }

                    ]
            });

            const job = JSON.parse(response.message.content);
           
            const embeddingText = `
                Job Title: ${job.job_title}

                Seniority Level: ${job.seniority_level}

                Experience Required: ${job.experience_required_years ?? 0} years

                Mandatory Skills:
                ${job.mandatory_skills.join(", ")}

                Preferred Skills:
                ${job.preferred_skills.join(", ")}

                Soft Skills:
                ${job.soft_skills.join(", ")}

                Summary:
                ${job.brief_summary ?? ""}
                `;

            const embeddingResponse = await ollama.embed({
                model: "embeddinggemma",
                input: embeddingText
                });

            const jdEmbedding =
                embeddingResponse.embeddings[0];

            const query = {
                projectName,
                recruiterList: list,
                adminId: decoded.id,
                jobTitle: job.job_title,
                seniorityLevel: job.seniority_level,
                experienceRequiredYears: job.experience_required_years,
                mandatorySkills: job.mandatory_skills,
                preferredSkills: job.preferred_skills,
                softSkills: job.soft_skills,
                briefSummary: job.brief_summary,
                embeddingText,
                jdEmbedding
            };

            const opening = await Opening.create(query);
        
        return res.status(201).json({message:opening});


    }
    catch(e)
    {
        console.log(e);
        res.status(400).json({message:"error from admin controller 2"});

    }
}

const getStatus=async (req,res)=>{

    try{
    
         const projects=await Opening.find({},"_id projectName");

        return res.status(201).json({message:projects});

    }
    catch(e)
    {
        console.log(e);
    }


}

const displaystatus=async (req,res)=>{
    try{
        const id=req.query.id;

        const response=await candidateMatch.find({openingId:id},{
            candidateName:1,
            matchedSkills:1,
            missingSkills:1,
            candidateId:1,
            overallScore:1,


        })

        return res.status(200).json({
            response,
        });


    }
    catch(e)
    {
        console.log(e);
        return res.status(400);   
    }
}

export {searchQuery,storeDetails,getStatus,displaystatus};