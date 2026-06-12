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
            status:1


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

        console.log(text);

        const prompt = `
            You are a STRICT JSON API.

Your ONLY job is to generate interview questions.

You MUST return EXACTLY 10 questions.

If any rule is violated, regenerate internally before returning.

==================================================
MANDATORY DISTRIBUTION
======================

TOTAL QUESTIONS = 10

EASY = 4 QUESTIONS

* 2 Aptitude
* 2 Technical

MEDIUM = 3 QUESTIONS

* 1 Aptitude
* 2 Technical

HARD = 3 QUESTIONS

* 1 Aptitude
* 2 Technical

TOTAL:

* Aptitude = 4
* Technical = 6

DO NOT RETURN UNTIL THESE COUNTS MATCH EXACTLY.

==================================================
QUESTION ORDER
==============

EASY

Question 1 = Aptitude
Question 2 = Aptitude
Question 3 = Technical
Question 4 = Technical

MEDIUM

Question 5 = Aptitude
Question 6 = Technical
Question 7 = Technical

HARD

Question 8 = Aptitude
Question 9 = Technical
Question 10 = Technical

==================================================
APTITUDE RULES
==============

Aptitude questions MUST NOT use any skill from the job description.

Generate aptitude questions from:

* Time and Work
* Speed Distance
* Train Problems
* Clock Problems
* Ages
* Ratio
* Percentage
* Profit and Loss
* Average
* Simple Interest
* Compound Interest

Generate NEW questions.

DO NOT copy examples.

==================================================
TECHNICAL RULES
===============

Technical questions MUST ONLY use skills from:

${text}

Generate technical questions from:

* Syntax
* Output Prediction
* Fill In The Blank
* Complete The Code
* API Concepts
* Database Queries
* Framework Concepts
* Language Fundamentals
* Async Programming
* OOP Concepts

DO NOT ask generic theory questions.

BAD:

What is JavaScript?
What is React?
Explain Node.js.

GOOD:

What is the output?
Complete the code.
Which query returns...?
Which hook should be used...?

==================================================
DIFFICULTY RULES
================

EASY

* Basic syntax
* Basic aptitude
* Beginner interview questions

MEDIUM

* Code snippets
* Output prediction
* Moderate aptitude calculations

HARD

* Tricky code output
* Async behaviour
* Closures
* Event loop
* Aggregation
* Complex aptitude calculations

==================================================
CODE QUESTION RULE
==================

If question type is:

* Output prediction
* Complete code
* Fill in the blank
* Find bug
* Predict result

THEN code field is REQUIRED.

Example:

{
"question": "What is the output of the following code?",
"code": "let x = '5' + 2; console.log(x);",
"options": {
"A": "7",
"B": "52",
"C": "Error",
"D": "undefined"
},
"correctAnswer": "B",
"type": "technical",
"difficulty": "medium"
}

NEVER generate output-based questions without a code field.

==================================================
NON-CODE QUESTION RULE
======================

For aptitude questions:

DO NOT include code field.

Example:

{
"question": "A train crosses a pole in 12 seconds...",
"options": {
"A": "100",
"B": "120",
"C": "150",
"D": "180"
},
"correctAnswer": "B",
"type": "aptitude",
"difficulty": "easy"
}

==================================================
OPTIONS RULES
=============

Every question MUST contain:

A
B
C
D

Exactly ONE correct answer.

Wrong answers must be realistic.

Do not create obviously wrong options.

==================================================
QUESTION OBJECT FORMAT
======================

For code-based questions:

{
"question": "",
"code": "",
"options": {
"A": "",
"B": "",
"C": "",
"D": ""
},
"correctAnswer": "",
"type": "technical",
"difficulty": ""
}

For non-code questions:

{
"question": "",
"options": {
"A": "",
"B": "",
"C": "",
"D": ""
},
"correctAnswer": "",
"type": "",
"difficulty": ""
}

==================================================
OUTPUT FORMAT
=============

Return ONLY VALID JSON.

{
"easy": [],
"medium": [],
"hard": []
}

No markdown.

No explanation.

No notes.

No code block.

No text before JSON.

No text after JSON.

==================================================
FINAL VALIDATION
================

Before returning verify:

✓ Total Questions = 10

✓ Easy = 4

✓ Medium = 3

✓ Hard = 3

✓ Aptitude = 4

✓ Technical = 6

✓ Every question has A B C D

✓ Exactly one correct answer

✓ Code questions contain code field

✓ Aptitude questions do NOT contain code field

✓ JSON is valid

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

        console.log(response);
        return res.status(200).json({message:"received cid"});
    }
    catch(err)
    {
        console.log(err);
    }

};

export {searchQuery,storeDetails,getStatus,displaystatus, rejectCandidate ,genQuestion};