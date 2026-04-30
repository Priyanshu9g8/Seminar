const API="http://localhost:8080/api";

function loadAnalytics(){

    fetch(API+"/analytics/students")
        .then(res=>res.json())
        .then(data=>{

            document.getElementById("total").innerText=data.totalStudents;
            document.getElementById("avg").innerText=data.averageScore;

            const list=document.getElementById("results");
            list.innerHTML="";

            data.results.forEach(r=>{

                const li=document.createElement("li");

                li.innerText=r.studentName+" - "+r.course+" - "+r.score;

                list.appendChild(li);

            });

        });

}
