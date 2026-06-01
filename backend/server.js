import express from "express"

const app=express();

app.use(express.json());

const PORT=process.env.PORT || 5010
app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
})