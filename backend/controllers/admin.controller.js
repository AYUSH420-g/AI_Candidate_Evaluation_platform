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

                model:"llama3.1:8b",
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

        const easyPrompt = `You are a senior technical interviewer.

Return ONLY valid JSON.
Do not return markdown.
Do not return explanations.
Do not return any text outside JSON.

====================================
INPUT
====================================

Candidate Technologies

${text}

Only use technologies mentioned above.

Never introduce any technology that is not listed.

====================================
TASK
====================================

Generate exactly 3 EASY interview questions.

Question Order

1. Aptitude
2. Aptitude
3. Technical

====================================
APTITUDE RULES
====================================

Generate numerical aptitude questions only.

Allowed topics

- Time & Work
- Speed & Distance
- Trains
- Ages
- Ratio
- Percentage
- Average
- Profit & Loss
- Probability
- SI
- CI
- Mixture

Never use programming or technology.

====================================
TECHNICAL RULES
====================================

Generate ONLY ONE technical question.

Use ONLY technologies from the candidate input.

Preferred styles

- Predict Output
- Complete Code
- Find Bug
- Debug Code
- Async
- Promise
- Closure
- Event Loop
- Express Middleware
- MongoDB Query
- React State

Avoid definitions.

Do NOT ask

"What is React?"
"What is Node?"
"Explain JavaScript."

====================================
MCQ RULES
====================================

Every question must contain

- exactly 4 options
- exactly 1 correct answer

Wrong answers should be realistic.

If code is required, fill the code field.

Otherwise

"code":""

====================================
OUTPUT
====================================

{
  "easy":[
    {
      "id":1,
      "type":"aptitude",
      "difficulty":"easy",
      "question":"",
      "code":"",
      "options":{
        "A":"",
        "B":"",
        "C":"",
        "D":""
      },
      "correctAnswer":"A"
    },
    {},
    {}
  ]
}`;    
        const mediumPrompt = `You are a senior technical interviewer.

Return ONLY valid JSON.
Do not return markdown.
Do not return explanations.
Do not return any text outside JSON.

====================================
INPUT
====================================

Candidate Technologies

${text}

Only use technologies mentioned above.

Never introduce technologies that are not listed.

====================================
TASK
====================================

Generate exactly 4 MEDIUM questions.

Question Order

1. Aptitude
2. Technical
3. Technical
4. Technical

====================================
IMPORTANT
====================================

ALL THREE technical questions MUST contain code.

The code field MUST NOT be empty.

Every coding question should require reasoning.

Preferred styles

- Predict Output
- Complete Code
- Find Bug
- Debug Code
- Async Programming
- Promise
- Event Loop
- Closures
- Express Middleware
- MongoDB Query
- Aggregation
- API Design
- React State

Avoid definitions.

====================================
APTITUDE
====================================

Generate ONE numerical aptitude question only.

Allowed topics

- Time & Work
- Speed & Distance
- Trains
- Ages
- Ratio
- Percentage
- Average
- Profit & Loss
- Probability
- SI
- CI
- Mixture

====================================
MCQ RULES
====================================

Each question must contain

- exactly 4 options
- exactly 1 correct answer

Wrong answers should be realistic.

====================================
OUTPUT
====================================

{
  "medium":[
    {
      "id":4,
      "type":"aptitude",
      "difficulty":"medium",
      "question":"",
      "code":"",
      "options":{
        "A":"",
        "B":"",
        "C":"",
        "D":""
      },
      "correctAnswer":"A"
    },
    {
      "id":5,
      "type":"technical",
      "difficulty":"medium",
      "question":"",
      "code":"",
      "options":{
        "A":"",
        "B":"",
        "C":"",
        "D":""
      },
      "correctAnswer":"A"
    },
    {},
    {}
  ]
}`;   
        const hardPrompt = `You are a senior technical interviewer.

Return ONLY valid JSON.
Do not return markdown.
Do not return explanations.
Do not return any text outside JSON.

====================================
INPUT
====================================

Candidate Technologies

${text}

Only use technologies mentioned above.

Never introduce technologies that are not listed.

====================================
TASK
====================================

Generate exactly 3 HARD questions.

Question Order

1. Aptitude
2. Technical
3. Technical

====================================
APTITUDE
====================================

Generate ONE numerical aptitude question.

Allowed topics

- Time & Work
- Speed & Distance
- Trains
- Ages
- Ratio
- Percentage
- Average
- Profit & Loss
- Probability
- SI
- CI
- Mixture

====================================
TECHNICAL
====================================

Generate TWO advanced technical questions.

Both MUST be scenario-based.

Do NOT ask theory.

Both MUST test deep practical knowledge.

Preferred topics

- Event Loop Internals
- Async Execution
- Promise Chain
- Memory Leaks
- Closures
- Hoisting Edge Cases
- React Rendering
- React Performance
- useEffect Bugs
- MongoDB Aggregation
- Aggregation Optimization
- Indexing
- Express Middleware
- API Design
- Authentication
- Transactions
- OOP Design
- Performance Optimization

Both questions MUST contain code.

The code field MUST NOT be empty.

====================================
MCQ RULES
====================================

Each question must contain

- exactly 4 options
- exactly 1 correct answer

Wrong answers should be realistic.

====================================
OUTPUT
====================================

{
  "hard":[
    {
      "id":8,
      "type":"aptitude",
      "difficulty":"hard",
      "question":"",
      "code":"",
      "options":{
        "A":"",
        "B":"",
        "C":"",
        "D":""
      },
      "correctAnswer":"A"
    },
    {
      "id":9,
      "type":"technical",
      "difficulty":"hard",
      "question":"",
      "code":"",
      "options":{
        "A":"",
        "B":"",
        "C":"",
        "D":""
      },
      "correctAnswer":"A"
    },
    {
      "id":10,
      "type":"technical",
      "difficulty":"hard",
      "question":"",
      "code":"",
      "options":{
        "A":"",
        "B":"",
        "C":"",
        "D":""
      },
      "correctAnswer":"A"
    }
  ]
}`;    
        const easyResponse = await ollama.chat({
    model: "llama3.1:8b",
    messages: [
        {
            role: "user",
            content: easyPrompt
        }
    ],
    format: "json"
});

const easyData = JSON.parse(easyResponse.message.content);

const mediumResponse = await ollama.chat({
    model: "llama3.1:8b",
    messages: [
        {
            role: "user",
            content: mediumPrompt
        }
    ],
    format: "json"
});

const mediumData = JSON.parse(mediumResponse.message.content);

const hardResponse = await ollama.chat({
    model: "llama3.1:8b",
    messages: [
        {
            role: "user",
            content: hardPrompt
        }
    ],
    format: "json"
});

const hardData = JSON.parse(hardResponse.message.content);

const data = {
    easy: easyData.easy,
    medium: mediumData.medium,
    hard: hardData.hard
};

console.log(data);


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

const aiGenerateOpening = async (req, res) => {
    try {
        const { prompt, token } = req.body;
        jwt.verify(token, process.env.JWT_SECRET);
        
        const systemPrompt = `
            You are an expert HR Job Description Parsing Engine.

            Your task is to analyze the following natural language description of a job opening and return ONLY a valid JSON object that exactly matches the schema provided below.

            ========================
            STRICT OUTPUT RULES
            ========================
            1. Return ONLY raw JSON.
            2. Do NOT return markdown.
            3. Do NOT return explanations.
            4. Output must be directly parsable using JSON.parse().

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
            JOB DESCRIPTION PROMPT
            ========================
            ${prompt}
        `;

        const response = await ollama.chat({
            model: "llama3.1:8b",
            messages: [{ role: "user", content: systemPrompt }]
        });

        let content = response.message.content;
        // In case ollama returns markdown despite instructions
        if (content.startsWith("\`\`\`json")) {
            content = content.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "");
        } else if (content.startsWith("\`\`\`")) {
            content = content.replace(/\`\`\`/g, "");
        }

        const jobData = JSON.parse(content);
        return res.status(200).json({ jobData });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Failed to generate AI opening details." });
    }
};

const aiCreateOpening = async (req, res) => {
    try {
        const { jobData, token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const recruiters = await User.find({ Role: "recruiter" }, "_id");
        const list = recruiters.map(r => r._id);

        const embeddingText = `
            Job Title: ${jobData.job_title}
            Seniority Level: ${jobData.seniority_level}
            Experience Required: ${jobData.experience_required_years ?? 0} years
            Mandatory Skills:
            ${(jobData.mandatory_skills || []).join(", ")}
            Preferred Skills:
            ${(jobData.preferred_skills || []).join(", ")}
            Soft Skills:
            ${(jobData.soft_skills || []).join(", ")}
            Summary:
            ${jobData.brief_summary ?? ""}
        `;

        const embeddingResponse = await ollama.embed({
            model: "embeddinggemma",
            input: embeddingText
        });

        const jdEmbedding = embeddingResponse.embeddings[0];

        const query = {
            projectName: jobData.job_title || "AI Generated Opening",
            recruiterList: list,
            adminId: decoded.id,
            jobTitle: jobData.job_title || "AI Generated Opening",
            seniorityLevel: jobData.seniority_level || "Junior",
            experienceRequiredYears: jobData.experience_required_years || 0,
            mandatorySkills: jobData.mandatory_skills || [],
            preferredSkills: jobData.preferred_skills || [],
            softSkills: jobData.soft_skills || [],
            briefSummary: jobData.brief_summary || "",
            embeddingText,
            jdEmbedding
        };

        const opening = await Opening.create(query);
        return res.status(201).json({ message: opening });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: e.message || "Failed to create opening." });
    }
};

export { aiGenerateOpening, aiCreateOpening };