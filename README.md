# AI Candidate Evaluation Platform 🚀

An AI-powered platform designed to streamline the candidate evaluation process. This platform allows recruiters to upload candidate resumes, evaluate their profiles using AI (powered by Ollama), and manage the hiring pipeline effectively.

## ✨ Features

- **Candidate Management:** Add, view, and manage candidates in the pipeline.
- **Resume Parsing:** Upload resumes (PDFs) and extract text automatically using `pdf-parse`.
- **AI-Powered Evaluation:** Leverage local LLM inference via **Ollama** to evaluate candidate skills, match them against job descriptions, and generate insights.
- **Secure Authentication:** JWT-based user authentication and bcrypt password hashing.
- **Modern UI:** Built with React, styled with Tailwind CSS, and using Lucide React for beautiful iconography.
- **One-Click Start:** Convenient shell script (`run.sh`) to boot up all services (Frontend, Backend, and Ollama) simultaneously.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (via Create React App)
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** Node.js with Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Ollama Node.js SDK
- **File Uploads:** Multer
- **Resume Processing:** pdf-parse
- **Security:** JSON Web Tokens (JWT), bcrypt, CORS

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)
- [Ollama](https://ollama.com/) (for local AI inference)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/AI_Candidate_Evaluation_platform.git
cd AI_Candidate_Evaluation_platform
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory. You can use the following template:

```env
PORT=5010
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

*Note: The frontend expects the backend to be running on `http://localhost:5010`.*

### 4. Running the Application

You can easily start the Frontend, Backend, and Ollama server all at once using the provided `run.sh` script:

```bash
# From the root directory of the project
chmod +x run.sh
./run.sh
```

The script will start:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5010
- **Ollama:** Running in the background

*To stop all services, simply press `CTRL+C` in the terminal where you ran the script.*

## 📂 Project Structure

```text
├── backend/               # Node.js Express server
│   ├── controllers/       # Route logic and handlers
│   ├── middleware/        # Express middlewares (auth, upload, etc.)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routing
│   ├── uploads/           # Temporarily stored uploaded resumes
│   ├── db.js              # Database connection setup
│   └── server.js          # Backend entry point
├── frontend/              # React application
│   ├── public/            # Static files
│   ├── src/               # React components, pages, and hooks
│   └── tailwind.config.js # Tailwind styling configuration
└── run.sh                 # Startup script for all services
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the issues page.

## 📝 License

This project is licensed under the ISC License.
