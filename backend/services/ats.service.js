import ollama from "ollama";

// Comprehensive dictionary of common resume spelling and grammar errors
const COMMON_SPELLING_MISTAKES = [
  { regex: /\b(teh|hte)\b/gi, error: "teh", fix: "the", explanation: "Typo in common article." },
  { regex: /\b(recieve|recieved|recieving)\b/gi, error: "recieve", fix: "receive", explanation: "Rule: 'i' before 'e' except after 'c'." },
  { regex: /\b(seperate|seperated|seperately)\b/gi, error: "seperate", fix: "separate", explanation: "Commonly misspelled with 'e' instead of 'a'." },
  { regex: /\b(experiance|experianced)\b/gi, error: "experiance", fix: "experience", explanation: "Spelled with 'e' ('experience')." },
  { regex: /\b(managment)\b/gi, error: "managment", fix: "management", explanation: "Missing middle 'e'." },
  { regex: /\b(responsable)\b/gi, error: "responsable", fix: "responsible", explanation: "Should end in '-ible'." },
  { regex: /\b(achivement|achivements|achive|achived)\b/gi, error: "achivement", fix: "achievement", explanation: "Missing 'e' in 'achieve'." },
  { regex: /\b(enviroment|enviromental)\b/gi, error: "enviroment", fix: "environment", explanation: "Missing 'n' after 'o'." },
  { regex: /\b(developement|developements)\b/gi, error: "developement", fix: "development", explanation: "Spelled without extra 'e'." },
  { regex: /\b(programing|programer|programers)\b/gi, error: "programing", fix: "programming", explanation: "Standard spelling has double 'm'." },
  { regex: /\b(maintainance)\b/gi, error: "maintainance", fix: "maintenance", explanation: "Changes vowel to '-ten-' in noun form." },
  { regex: /\b(recommand|recommanded|recommandation)\b/gi, error: "recommand", fix: "recommend", explanation: "Spelled with 'e' ('recommend')." },
  { regex: /\b(collegue|collegues)\b/gi, error: "collegue", fix: "colleague", explanation: "Missing 'a' in 'colleague'." },
  { regex: /\b(calender)\b/gi, error: "calender", fix: "calendar", explanation: "Spelled with '-ar'." },
  { regex: /\b(succesfull|succesful|sucessful)\b/gi, error: "succesfull", fix: "successful", explanation: "Double 'c' and double 's', single 'l' at end." },
  { regex: /\b(goverment)\b/gi, error: "goverment", fix: "government", explanation: "Missing 'n'." },
  { regex: /\b(impliment|implimented|implimentation)\b/gi, error: "impliment", fix: "implement", explanation: "Spelled with 'e' ('implement')." },
  { regex: /\b(certifcate|certifcates)\b/gi, error: "certifcate", fix: "certificate", explanation: "Missing 'i'." },
  { regex: /\b(profesional|profesionals)\b/gi, error: "profesional", fix: "professional", explanation: "Double 's' ('professional')." },
  { regex: /\b(occured|occuring)\b/gi, error: "occured", fix: "occurred", explanation: "Double 'r' in past tense." },
  { regex: /\b(refered|refering)\b/gi, error: "refered", fix: "referred", explanation: "Double 'r' in past tense." },
  { regex: /\b(comunication)\b/gi, error: "comunication", fix: "communication", explanation: "Double 'm' ('communication')." },
  { regex: /\b(definitly)\b/gi, error: "definitly", fix: "definitely", explanation: "Spelled with 'i' ('definitely')." },
  { regex: /\b(independant)\b/gi, error: "independant", fix: "independent", explanation: "Ends with '-ent'." },
  { regex: /\b(untill)\b/gi, error: "untill", fix: "until", explanation: "Single 'l' in 'until'." },
  { regex: /\b(lead\s+to\s+a)\b/gi, error: "lead to a (past context)", fix: "led to a", explanation: "Use 'led' for past tense, not 'lead'." },
  { regex: /\b(alot)\b/gi, error: "alot", fix: "a lot", explanation: "'A lot' is two distinct words." },
  { regex: /\b(there\s+are\s+less)\b/gi, error: "there are less", fix: "there are fewer", explanation: "Use 'fewer' for countable items." }
];

// Passive voice indicators that reduce ATS impact
const PASSIVE_VOICE_PATTERNS = [
  { regex: /\b(was\s+responsible\s+for|were\s+responsible\s+for)\b/gi, fix: "Led / Managed / Spearheaded", explanation: "Use strong active action verbs instead of passive duty descriptions." },
  { regex: /\b(worked\s+on)\b/gi, fix: "Architected / Developed / Implemented", explanation: "'Worked on' is weak. Specify your exact contribution." },
  { regex: /\b(helped\s+with|assisted\s+in)\b/gi, fix: "Collaborated to / Co-engineered / Facilitated", explanation: "Highlight your ownership and collaborative role directly." },
  { regex: /\b(duties\s+included)\b/gi, fix: "Delivered / Orchestrated / Spearheaded", explanation: "Focus on results and achievements rather than listed job duties." }
];

// Clichés and weak filler buzzwords
const BUZZWORDS = [
  "hard-working", "hardworking", "results-driven", "fast learner", "team player",
  "detail-oriented", "detail oriented", "think outside the box", "go-getter", "self-motivated",
  "synergy", "dynamic individual", "punctual", "good communicator"
];

// Strong ATS Power Action Verbs
const ACTION_VERBS = [
  "architected", "engineered", "developed", "built", "spearheaded", "orchestrated",
  "optimized", "accelerated", "designed", "streamlined", "automated", "delivered",
  "scaled", "launched", "implemented", "deployed", "transformed", "championed",
  "integrated", "authored", "reduced", "increased", "maximized", "negotiated",
  "mentored", "directed", "revamped", "formulated", "pioneered", "refactored"
];

// Standard ATS Essential Sections
const SECTION_KEYWORDS = {
  summary: ["summary", "professional summary", "about me", "profile", "objective", "career objective"],
  experience: ["experience", "work experience", "employment history", "professional experience", "work history", "career history"],
  education: ["education", "academic history", "academic background", "degrees", "educational qualifications"],
  skills: ["skills", "technical skills", "core competencies", "competencies", "technologies", "proficiencies", "areas of expertise"],
  projects: ["projects", "personal projects", "key projects", "academic projects", "technical projects"],
  certifications: ["certifications", "certificates", "licenses", "training", "courses", "accreditations"]
};

// Skill Taxonomy Database for extraction
const TECH_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "php", "go", "golang", "rust", "swift", "kotlin", "scala",
  "react", "react.js", "reactjs", "next.js", "vue", "vue.js", "angular", "node.js", "nodejs", "express", "express.js", "django", "flask", "fastapi", "spring", "spring boot", "laravel",
  "html", "html5", "css", "css3", "tailwind", "tailwind css", "bootstrap", "sass", "redux", "graphql", "rest api", "restful api",
  "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "elasticsearch", "oracle", "prisma", "mongoose",
  "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "ci/cd", "git", "github", "gitlab", "terraform", "ansible", "jenkins", "linux", "nginx",
  "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "data analysis", "sql", "tableau", "power bi"
];

const SOFT_SKILLS = [
  "leadership", "agile", "scrum", "project management", "problem solving", "cross-functional collaboration",
  "strategic planning", "stakeholder management", "mentorship", "public speaking", "critical thinking"
];

/**
 * Analyzes resume raw text for ATS suitability, spelling, grammar, structure, and suggestions.
 * @param {string} text - Raw resume text extracted from PDF
 * @param {string} [jobDescription] - Optional target job description for matching
 * @returns {object} Full ATS analysis result
 */
export async function evaluateResumeATS(text, jobDescription = "") {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("No readable text found in the uploaded resume.");
  }

  const cleanText = text.replace(/\r\n/g, "\n");
  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
  const words = cleanText.match(/\b[A-Za-z0-9+#.-]+\b/g) || [];
  const wordCount = words.length;

  // 1. SPELLING & GRAMMAR ANALYSIS
  const spellingGrammarIssues = [];
  const lowercaseText = cleanText.toLowerCase();

  // Check common spelling errors with context extraction
  for (const item of COMMON_SPELLING_MISTAKES) {
    let match;
    const regex = new RegExp(item.regex.source, "gi");
    while ((match = regex.exec(cleanText)) !== null) {
      const matchIndex = match.index;
      const start = Math.max(0, matchIndex - 30);
      const end = Math.min(cleanText.length, matchIndex + match[0].length + 30);
      const context = cleanText.substring(start, end).replace(/\n/g, " ").trim();

      spellingGrammarIssues.push({
        type: "Spelling",
        found: match[0],
        fix: item.fix,
        context: `...${context}...`,
        explanation: item.explanation,
        severity: "error"
      });
      if (spellingGrammarIssues.length >= 15) break;
    }
  }

  // Check repeated consecutive words (e.g. "in in", "the the")
  const repeatedWordsRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let repMatch;
  while ((repMatch = repeatedWordsRegex.exec(cleanText)) !== null) {
    const start = Math.max(0, repMatch.index - 25);
    const end = Math.min(cleanText.length, repMatch.index + repMatch[0].length + 25);
    const context = cleanText.substring(start, end).replace(/\n/g, " ").trim();
    spellingGrammarIssues.push({
      type: "Grammar",
      found: repMatch[0],
      fix: repMatch[1],
      context: `...${context}...`,
      explanation: `Accidental repeated word '${repMatch[1]}'.`,
      severity: "error"
    });
  }

  // Check passive & weak phrasing
  const passiveVoiceIssues = [];
  for (const item of PASSIVE_VOICE_PATTERNS) {
    let match;
    const regex = new RegExp(item.regex.source, "gi");
    while ((match = regex.exec(cleanText)) !== null) {
      const start = Math.max(0, match.index - 25);
      const end = Math.min(cleanText.length, match.index + match[0].length + 25);
      const context = cleanText.substring(start, end).replace(/\n/g, " ").trim();
      passiveVoiceIssues.push({
        type: "Style & Phrasing",
        found: match[0],
        fix: item.fix,
        context: `...${context}...`,
        explanation: item.explanation,
        severity: "warning"
      });
      if (passiveVoiceIssues.length >= 8) break;
    }
  }

  // 2. CONTACT INFORMATION CHECKS
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}/g;
  const linkedinRegex = /(linkedin\.com\/in\/[A-Za-z0-9_-]+)/i;
  const githubRegex = /(github\.com\/[A-Za-z0-9_-]+|gitlab\.com\/[A-Za-z0-9_-]+)/i;
  const portfolioRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;

  const detectedEmails = cleanText.match(emailRegex) || [];
  const detectedPhones = cleanText.match(phoneRegex) || [];
  const hasLinkedin = linkedinRegex.test(cleanText);
  const hasGithub = githubRegex.test(cleanText);
  const hasPortfolio = portfolioRegex.test(cleanText);

  // Attempt name detection: usually within first 3 non-empty lines
  let detectedName = null;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.length > 2 && line.length < 40 && !line.includes("@") && !line.includes("http") && !/\d{4,}/.test(line)) {
      detectedName = line;
      break;
    }
  }

  const contactChecklist = [
    { item: "Candidate Name", passed: !!detectedName, value: detectedName || "Not clearly identified in top header" },
    { item: "Email Address", passed: detectedEmails.length > 0, value: detectedEmails[0] || "Missing" },
    { item: "Phone Number", passed: detectedPhones.length > 0, value: detectedPhones[0] || "Missing" },
    { item: "LinkedIn Profile", passed: hasLinkedin, value: hasLinkedin ? "Detected" : "Not Found (Recommended)" },
    { item: "Portfolio / GitHub", passed: hasGithub || hasPortfolio, value: hasGithub ? "GitHub Detected" : (hasPortfolio ? "Portfolio Link Detected" : "Not Found") }
  ];

  // 3. ESSENTIAL SECTIONS DETECTION
  const sectionsStatus = {};
  for (const [sectionKey, keywords] of Object.entries(SECTION_KEYWORDS)) {
    const found = keywords.some(keyword => {
      const reg = new RegExp(`(^|\\n)\\s*(${keyword})\\s*(\\n|:|$)`, "i");
      return reg.test(cleanText);
    });
    sectionsStatus[sectionKey] = found;
  }

  // 4. MEASURABLE IMPACT & QUANTIFIABLE METRICS
  const metricRegex = /(\b\d+([.,]\d+)?\s*(%|percent|x|X|\+)\b|\$[\d,]+|\b(saved|increased|reduced|grew|achieved|improved|cut)\s+[^\n.,;]+(\d+|%))/gi;
  const metricsFound = cleanText.match(metricRegex) || [];
  const metricCount = metricsFound.length;

  // Action verbs check
  const usedActionVerbs = [];
  const lowerWords = words.map(w => w.toLowerCase());
  for (const verb of ACTION_VERBS) {
    if (lowerWords.includes(verb)) {
      usedActionVerbs.push(verb);
    }
  }

  // Buzzwords check
  const detectedBuzzwords = [];
  for (const buzz of BUZZWORDS) {
    if (lowercaseText.includes(buzz)) {
      detectedBuzzwords.push(buzz);
    }
  }

  // 5. SKILLS EXTRACTION
  const extractedTechSkills = [];
  for (const skill of TECH_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[.+*?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
    if (regex.test(cleanText)) {
      extractedTechSkills.push(skill);
    }
  }

  const extractedSoftSkills = [];
  for (const skill of SOFT_SKILLS) {
    if (lowercaseText.includes(skill)) {
      extractedSoftSkills.push(skill);
    }
  }

  // Bullet point ratio
  const bulletCount = (cleanText.match(/^[•\-\*–]\s+/gm) || []).length;
  const hasBullets = bulletCount >= 5;

  // 6. SCORING COMPUTATION (0 - 100)
  // A. Spelling & Grammar (Max 25 pts)
  let grammarScore = 25;
  const totalSpellingErrors = spellingGrammarIssues.length;
  grammarScore -= totalSpellingErrors * 3; // -3 per direct spelling/grammar error
  grammarScore -= Math.min(6, passiveVoiceIssues.length * 1.5); // minor penalty for passive voice
  grammarScore = Math.max(5, Math.min(25, Math.round(grammarScore)));

  // B. ATS Structure & Sections (Max 25 pts)
  let structureScore = 0;
  // Contact info (up to 10 pts)
  if (detectedName) structureScore += 2;
  if (detectedEmails.length > 0) structureScore += 3;
  if (detectedPhones.length > 0) structureScore += 2;
  if (hasLinkedin) structureScore += 2;
  if (hasGithub || hasPortfolio) structureScore += 1;

  // Sections (up to 12 pts)
  if (sectionsStatus.experience) structureScore += 3;
  if (sectionsStatus.education) structureScore += 3;
  if (sectionsStatus.skills) structureScore += 3;
  if (sectionsStatus.projects || sectionsStatus.certifications) structureScore += 2;
  if (sectionsStatus.summary) structureScore += 1;

  // Length & format (up to 3 pts)
  if (wordCount >= 300 && wordCount <= 1200) structureScore += 2;
  else if (wordCount >= 200 && wordCount <= 1500) structureScore += 1;
  if (hasBullets) structureScore += 1;

  structureScore = Math.max(5, Math.min(25, Math.round(structureScore)));

  // C. Measurable Impact & Verbs (Max 25 pts)
  let impactScore = 0;
  // Metric density (up to 12 pts)
  if (metricCount >= 6) impactScore += 12;
  else if (metricCount >= 4) impactScore += 9;
  else if (metricCount >= 2) impactScore += 6;
  else if (metricCount >= 1) impactScore += 3;

  // Action verbs (up to 10 pts)
  const uniqueActionVerbs = [...new Set(usedActionVerbs)];
  if (uniqueActionVerbs.length >= 8) impactScore += 10;
  else if (uniqueActionVerbs.length >= 5) impactScore += 7;
  else if (uniqueActionVerbs.length >= 3) impactScore += 5;
  else if (uniqueActionVerbs.length >= 1) impactScore += 3;

  // Buzzword deduction (-1 each, max -4)
  impactScore -= Math.min(4, detectedBuzzwords.length);
  if (hasBullets) impactScore += 3;

  impactScore = Math.max(5, Math.min(25, Math.round(impactScore)));

  // D. Skills & Keywords (Max 25 pts)
  let skillsScore = 0;
  const totalSkillsCount = extractedTechSkills.length;
  if (totalSkillsCount >= 15) skillsScore += 18;
  else if (totalSkillsCount >= 10) skillsScore += 14;
  else if (totalSkillsCount >= 6) skillsScore += 10;
  else if (totalSkillsCount >= 3) skillsScore += 6;
  else skillsScore += 3;

  if (extractedSoftSkills.length >= 3) skillsScore += 4;
  else if (extractedSoftSkills.length >= 1) skillsScore += 2;

  if (sectionsStatus.skills) skillsScore += 3;
  skillsScore = Math.max(5, Math.min(25, Math.round(skillsScore)));

  // Total Score (0 - 100)
  const overallScore = grammarScore + structureScore + impactScore + skillsScore;

  // Overall Grade & Rating
  let rating = "Needs Work";
  let ratingColor = "amber";
  if (overallScore >= 85) {
    rating = "Excellent (ATS Ready)";
    ratingColor = "emerald";
  } else if (overallScore >= 70) {
    rating = "Good (Competitive)";
    ratingColor = "green";
  } else if (overallScore >= 55) {
    rating = "Average (Improvements Needed)";
    ratingColor = "amber";
  } else {
    rating = "High Risk (Likely Filtered by ATS)";
    ratingColor = "rose";
  }

  // 7. GENERATE ACTIONABLE IMPROVEMENTS
  const criticalImprovements = [];
  const recommendedImprovements = [];
  const optimizationTips = [];

  // Critical
  if (totalSpellingErrors > 0) {
    criticalImprovements.push({
      title: `Fix ${totalSpellingErrors} spelling and typographical error${totalSpellingErrors > 1 ? "s" : ""}`,
      description: "Automated ATS parsers may misinterpret keywords or disqualify resumes with spelling mistakes. Review the detected list below.",
      category: "Spelling & Grammar"
    });
  }
  if (detectedEmails.length === 0) {
    criticalImprovements.push({
      title: "Missing Primary Email Address",
      description: "ATS systems require a clear contact email to parse and automatically create candidate profiles.",
      category: "Contact Essentials"
    });
  }
  if (detectedPhones.length === 0) {
    criticalImprovements.push({
      title: "Missing Phone Number",
      description: "Add an international or local phone number formatted cleanly in your header.",
      category: "Contact Essentials"
    });
  }
  if (!sectionsStatus.experience) {
    criticalImprovements.push({
      title: "Missing Standard 'Work Experience' Section",
      description: "ATS systems specifically look for headers like 'Work Experience' or 'Professional Experience' to index your career history.",
      category: "ATS Structure"
    });
  }
  if (!sectionsStatus.skills) {
    criticalImprovements.push({
      title: "Missing Dedicated 'Skills' Section",
      description: "Ensure a dedicated section named 'Technical Skills' or 'Skills' exists so the keyword parser indexes your proficiencies.",
      category: "ATS Structure"
    });
  }

  // Recommended
  if (metricCount < 4) {
    recommendedImprovements.push({
      title: "Add Quantifiable Metrics to Bullet Points",
      description: `Only ${metricCount} measurable metric(s) detected. Include percentages (%), dollar amounts ($), latency gains, or team sizes (e.g. 'Boosted performance by 35%').`,
      category: "Impact & Results"
    });
  }
  if (uniqueActionVerbs.length < 5) {
    recommendedImprovements.push({
      title: "Strengthen Action Verbs",
      description: "Replace generic verbs with high-impact power verbs like 'Architected', 'Spearheaded', 'Engineered', 'Optimized', and 'Accelerated'.",
      category: "Impact & Results"
    });
  }
  if (passiveVoiceIssues.length > 0) {
    recommendedImprovements.push({
      title: `Eliminate Passive Phrases (${passiveVoiceIssues.length} found)`,
      description: "Phrases like 'was responsible for' or 'worked on' weaken your impact. State direct actions and accomplishments instead.",
      category: "Style & Phrasing"
    });
  }
  if (!hasLinkedin) {
    recommendedImprovements.push({
      title: "Include LinkedIn Profile URL",
      description: "Over 87% of recruiters cross-reference LinkedIn profiles. Add a clean link in the top contact section.",
      category: "Contact Essentials"
    });
  }
  if (totalSkillsCount < 8) {
    recommendedImprovements.push({
      title: "Expand Technical Keywords",
      description: `Only ${totalSkillsCount} core skills detected. Explicitly list tools, databases, frameworks, and methodologies relevant to your target role.`,
      category: "Keyword Optimization"
    });
  }

  // Optimization Tips
  if (wordCount < 300) {
    optimizationTips.push({
      title: "Resume is too brief",
      description: `Current word count is ~${wordCount} words. A standard 1-page resume typically contains 400 to 750 words of detailed experience and projects.`,
      category: "Formatting"
    });
  } else if (wordCount > 1200) {
    optimizationTips.push({
      title: "Consider tightening resume length",
      description: `Resume contains ~${wordCount} words. Aim for concise, punchy bullet points to keep reader engagement high and parsing clean.`,
      category: "Formatting"
    });
  }
  if (detectedBuzzwords.length > 0) {
    optimizationTips.push({
      title: `Replace generic buzzwords (${detectedBuzzwords.slice(0, 3).join(", ")})`,
      description: "Instead of claiming you are a 'team player' or 'hard-working', demonstrate it through concrete project examples and deliverables.",
      category: "Style & Phrasing"
    });
  }
  if (!sectionsStatus.summary) {
    optimizationTips.push({
      title: "Add a 2-3 sentence Professional Summary",
      description: "A concise summary at the top helps both ATS semantic search and hiring managers grasp your seniority and core specialization.",
      category: "ATS Structure"
    });
  }
  if (!hasBullets) {
    optimizationTips.push({
      title: "Use consistent bullet points",
      description: "Avoid dense paragraphs for work history. Clear bullet points improve ATS parsing readability and human skim value.",
      category: "Formatting"
    });
  }

  // 8. OPTIONAL AI ENHANCEMENT VIA OLLAMA (Non-blocking fallback)
  let aiExecutiveFeedback = null;
  try {
    const aiPrompt = `You are a Principal Technical Recruiter and ATS Optimization Specialist.
Review this candidate resume text summary:
- Detected Name: ${detectedName || "Candidate"}
- Word Count: ${wordCount}
- Overall ATS Score: ${overallScore}/100
- Core Skills: ${extractedTechSkills.slice(0, 12).join(", ") || "None"}
- Target Job / Notes: ${jobDescription || "General Software/Tech"}

Provide a concise 3-4 sentence professional executive evaluation focusing on:
1. Candidate's core positioning and clarity.
2. The single highest-impact change they should make to pass senior recruiter screening.
3. Keep it encouraging, authoritative, and direct.`;

    const aiRes = await Promise.race([
      ollama.chat({
        model: "llama3.1:8b",
        messages: [{ role: "user", content: aiPrompt }]
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Ollama timeout")), 4000))
    ]);

    if (aiRes?.message?.content) {
      aiExecutiveFeedback = aiRes.message.content.trim();
    }
  } catch (err) {
    // Graceful fallback if Ollama is not running or timed out
    aiExecutiveFeedback = `Resume shows solid fundamentals with ${extractedTechSkills.length} identified competencies. To elevate this profile to top-tier ATS compliance, focus on eliminating identified typographical inconsistencies and embedding quantifiable metrics (%, $) into every experience bullet point.`;
  }

  return {
    candidateName: detectedName || "Candidate Resume",
    wordCount,
    overallScore,
    rating,
    ratingColor,
    scores: {
      spellingGrammar: {
        score: grammarScore,
        max: 25,
        percentage: Math.round((grammarScore / 25) * 100),
        status: grammarScore >= 20 ? "Good" : (grammarScore >= 15 ? "Average" : "Needs Attention"),
        errorsCount: totalSpellingErrors + passiveVoiceIssues.length
      },
      structureFormatting: {
        score: structureScore,
        max: 25,
        percentage: Math.round((structureScore / 25) * 100),
        status: structureScore >= 20 ? "Good" : (structureScore >= 15 ? "Average" : "Needs Attention"),
        missingSections: Object.entries(sectionsStatus).filter(([, v]) => !v).map(([k]) => k)
      },
      impactAction: {
        score: impactScore,
        max: 25,
        percentage: Math.round((impactScore / 25) * 100),
        status: impactScore >= 20 ? "Strong" : (impactScore >= 14 ? "Moderate" : "Weak"),
        metricsCount: metricCount,
        actionVerbsCount: uniqueActionVerbs.length
      },
      skillsKeywords: {
        score: skillsScore,
        max: 25,
        percentage: Math.round((skillsScore / 25) * 100),
        status: skillsScore >= 20 ? "Comprehensive" : (skillsScore >= 14 ? "Moderate" : "Limited"),
        skillsCount: totalSkillsCount
      }
    },
    issues: {
      spellingAndGrammar: spellingGrammarIssues,
      passivePhrases: passiveVoiceIssues,
      buzzwords: detectedBuzzwords
    },
    checklist: {
      contacts: contactChecklist,
      sections: Object.entries(sectionsStatus).map(([section, found]) => ({
        section: section.charAt(0).toUpperCase() + section.slice(1),
        found
      }))
    },
    extracted: {
      techSkills: extractedTechSkills,
      softSkills: extractedSoftSkills,
      actionVerbsUsed: uniqueActionVerbs,
      metricsFound: metricsFound.slice(0, 10)
    },
    suggestions: {
      critical: criticalImprovements,
      recommended: recommendedImprovements,
      optimization: optimizationTips
    },
    aiExecutiveFeedback
  };
}
