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

        const {projectName, token}=req.body;
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
            recommendation:1,
            status:1,
            link:1,
            testScore:1,
            totalQuestions:1,
            testSubmitted:1,
            Questions:1


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
};

const rejectCandidate=async(req,res)=>{

    try{
        // const status=req.body.status;

        const update=await candidateMatch.findOneAndUpdate({candidateId:req.params.id},
            { status: "Rejected" },
            { returnDocument: "after" });

            console.log(update);
            res.status(200).json(update);
    }
    catch(err)
    {
        console.log(err);
    }

};

const genQuestion=async(req,res)=>{

    try{
        const {candidateId}=req.body;
        
        const o_id=await candidateMatch.findOne({candidateId:candidateId},
            {openingId:1,_id:0});
        console.log(o_id.openingId);

            
        const text=await Opening.findById({_id:o_id.openingId},{
            embeddingText:1
        })

        // console.log(text);

        function generate() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            let str = '';
            for (let i = 0; i < 5; i++) {
                str += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            let num = '';
            for (let i = 0; i < 5; i++) {
                num += Math.floor(Math.random() * 10);
            }

            return `${str}#${num}`;
        }

        const url=generate();

        const prompt = `
            You are a STRICT JSON API.

Your ONLY task is to generate interview questions.

IMPORTANT:

* Return ONLY valid JSON.
* No markdown.
* No explanations.
* No notes.
* No text before JSON.
* No text after JSON.
* Output must be directly parsable by JSON.parse().

==================================================
INPUT
=====

The technical skills, frameworks, languages, and tools will be provided in:

${text}

Generate questions ONLY from skills mentioned in ${text}.

Do NOT use any technology that is not present in ${text}.

==================================================
QUESTION COUNT (MANDATORY)
==========================

Generate EXACTLY 10 questions.

Distribution:

Easy = 4 Questions

* 2 Aptitude
* 2 Technical

Medium = 3 Questions

* 1 Aptitude
* 2 Technical

Hard = 3 Questions

* 1 Aptitude
* 2 Technical

Total:

* Aptitude = 4
* Technical = 6



==================================================
EXPERIENCE LEVEL
================

Assume candidate has 3-5 years of professional experience.

Questions should be realistic interview questions asked to experienced developers.

Avoid fresher-level generic theory questions.

==================================================
APTITUDE RULES
==============

Aptitude questions MUST NOT use any technology from ${text}.

Generate aptitude questions from topics such as:

* Time and Work
* Speed Distance
* Train Problems
* Ages
* Ratio
* Percentage
* Profit and Loss
* Average
* Simple Interest
* Compound Interest
* Probability
* Mixture and Allegation

Requirements:

* Numerical aptitude only.
* Moderate to challenging interview level.
* Must have exactly one correct answer.
* No code field.

==================================================
TECHNICAL RULES
===============

Technical questions MUST be generated ONLY from technologies found in ${text}.

Preferred question styles:

* Output Prediction
* Complete The Code
* Fill In The Blank
* Find Bug
* API Design
* Database Query
* Aggregation
* Async Programming
* Closures
* OOP Concepts
* Framework Behavior
* Middleware Concepts
* Query Optimization
* State Management
* Promise Handling

Avoid generic questions like:

❌ What is JavaScript?
❌ Explain React.
❌ What is Node.js?

Prefer:

✅ What is the output?
✅ Which query returns the correct result?
✅ Complete the missing code.
✅ Which API behavior is correct?
✅ Which middleware executes first?
✅ Which aggregation pipeline returns the expected result?

==================================================
CODE QUESTION RULE
==================

For any of the following:

* Output Prediction
* Complete Code
* Fill In The Blank
* Debugging
* Find Bug
* Predict Result
* Async Behavior
* Closure Question

A "code" field is REQUIRED.

Never generate these question types without code.

Example:

{
"question": "What is the output?",
"code": "console.log(typeof null)",
"options": {
"A": "null",
"B": "object",
"C": "undefined",
"D": "number"
},
"correctAnswer": "B",
"type": "technical",
"difficulty": "medium"
}

==================================================
OPTIONS RULES
=============

Every question MUST contain:

{
"A": "...",
"B": "...",
"C": "...",
"D": "..."
}

Requirements:

* Exactly 4 options.
* Exactly 1 correct answer.
* Wrong answers must be realistic.
* Wrong answers should be confusing and close to the correct answer.
* Avoid obviously wrong choices.

==================================================
QUESTION OBJECT FORMAT
======================

CODE QUESTION

{
"question": "",
"code": "",
"options": {
"A": "",
"B": "",
"C": "",
"D": ""
},
"correctAnswer": "A",
"type": "technical",
"difficulty": "easy"
}

NON-CODE QUESTION

{
"question": "",
"options": {
"A": "",
"B": "",
"C": "",
"D": ""
},
"correctAnswer": "A",
"type": "aptitude",
"difficulty": "easy"
}

==================================================
OUTPUT FORMAT
=============

{
"easy": [
{},
{},
{},
{}
],
"medium": [
{},
{},
{}
],
"hard": [
{},
{},
{}
]
}

==================================================
ORDER RULE (MANDATORY)
======================

Easy:
1 = Aptitude
2 = Aptitude
3 = Technical
4 = Technical

Medium:
5 = Aptitude
6 = Technical
7 = Technical

Hard:
8 = Aptitude
9 = Technical
10 = Technical

==================================================
FINAL VALIDATION
================

Before returning:

✓ Valid JSON

✓ Exactly 10 Questions

✓ Easy = 4

✓ Medium = 3

✓ Hard = 3

✓ Aptitude = 4

✓ Technical = 6

✓ Technical questions only from ${text}

✓ Every question has A,B,C,D

✓ Exactly one correct answer

✓ Code questions contain code field

✓ Aptitude questions do NOT contain code field

✓ JSON.parse(output) must succeed

If any validation fails, regenerate internally and return corrected JSON only.



            `;

        const response=await ollama.chat(
            {
                model:"llama3.2:3b",
                messages:[
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                format: "json"
            }   
        );


        const data=JSON.parse(response.message.content);
        console.log(data);

        const updated = await candidateMatch.findOneAndUpdate(
        {
            candidateId,
            openingId: o_id.openingId
        },
        {
            $set: {
            Questions: data,
            link: true,
            status:"Accepted",
            link_url:url
            }
        },
        {
            returnDocument: "after",
            runValidators: true
        }
        );

        console.log(updated);
        res.status(200).json(updated);
    }
    catch(err)
    {
        console.log(err);
    }

};

export {searchQuery,storeDetails,getStatus,displaystatus, rejectCandidate ,genQuestion};