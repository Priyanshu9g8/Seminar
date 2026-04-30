const API="http://localhost:8080/api";

function askTeacher(){

    const question=document.getElementById("teacherQuestion").value;

    fetch(API+"/ai/teacher?q="+question)
        .then(res=>res.text())
        .then(data=>{
            document.getElementById("teacherAnswer").innerText=data;
        });

}

function generateQuiz(){

    const topic=document.getElementById("quizTopic").value;

    fetch(API+"/ai/quiz?topic="+topic)
        .then(res=>res.json())
        .then(data=>{

            localStorage.setItem("quiz", JSON.stringify(data));

            const list=document.getElementById("quizList");
            list.innerHTML="";

            data.forEach(q=>{
                const li=document.createElement("li");
                li.innerText=q.question;
                list.appendChild(li);
            });

        });

}

// offline loading
window.onload=function(){

    const saved=localStorage.getItem("quiz");

    if(saved){

        const data=JSON.parse(saved);

        const list=document.getElementById("quizList");

        data.forEach(q=>{
            const li=document.createElement("li");
            li.innerText=q.question;
            list.appendChild(li);
        });

    }

}