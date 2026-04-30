export function generateQuiz(topic, language){

    const quizzes = {

        en:[
            {
                question:`What is ${topic}?`,
                options:["Concept","Animal","City","Game"]
            },
            {
                question:`Which statement is correct about ${topic}?`,
                options:["Option A","Option B","Option C","Option D"]
            }
        ],

        hi:[
            {
                question:`${topic} क्या है?`,
                options:["एक अवधारणा","एक जानवर","एक शहर","एक खेल"]
            },
            {
                question:`${topic} के बारे में सही कथन कौन सा है?`,
                options:["विकल्प A","विकल्प B","विकल्प C","विकल्प D"]
            }
        ],

        pa:[
            {
                question:`${topic} ਕੀ ਹੈ?`,
                options:["ਇੱਕ ਧਾਰਣਾ","ਇੱਕ ਜਾਨਵਰ","ਇੱਕ ਸ਼ਹਿਰ","ਇੱਕ ਖੇਡ"]
            },
            {
                question:`${topic} ਬਾਰੇ ਸਹੀ ਬਿਆਨ ਕਿਹੜਾ ਹੈ?`,
                options:["ਚੋਣ A","ਚੋਣ B","ਚੋਣ C","ਚੋਣ D"]
            }
        ]

    }

    return quizzes[language] || quizzes.en
}