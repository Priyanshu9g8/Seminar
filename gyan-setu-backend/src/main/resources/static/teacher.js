const API="http://localhost:8080/api";

function askAI(){

    const q=document.getElementById("teacherQuestion").value;

    fetch(API+"/ai/chat?q="+q)
        .then(res=>res.text())
        .then(data=>{
            document.getElementById("teacherAnswer").innerText=data;
        });

}

function generateQuiz(){

    const topic=document.getElementById("topic").value;

    fetch(API+"/ai/quiz?topic="+topic)
        .then(res=>res.json())
        .then(data=>{

            const list=document.getElementById("quiz");
            list.innerHTML="";

            data.forEach(q=>{
                const li=document.createElement("li");
                li.innerText=q.question;
                list.appendChild(li);
            });

        });

}

function loadCourses(){

    fetch(API+"/courses")
        .then(res=>res.json())
        .then(data=>{

            const list=document.getElementById("courses");
            list.innerHTML="";

            data.forEach(c=>{
                const li=document.createElement("li");
                li.innerText=c.title;
                list.appendChild(li);
            });

        });

}
