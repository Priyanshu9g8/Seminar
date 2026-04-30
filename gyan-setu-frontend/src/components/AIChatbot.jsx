import { useState } from "react";
import { askAI } from "../api/axios";

export default function AIChatbot() {

    const [question, setQuestion] = useState("");
    const [response, setResponse] = useState("");

    const handleAsk = async () => {


if(!question) return;

const res = await askAI(question);

setResponse(res);


    };

    return (


<div className="fixed bottom-5 right-5 bg-white shadow-lg p-4 rounded-xl w-72">

  <h3 className="font-bold mb-2">AI Teacher</h3>

  <input
    className="border p-2 w-full"
    placeholder="Ask a question"
    value={question}
    onChange={(e)=>setQuestion(e.target.value)}
  />

  <button
    className="bg-blue-500 text-white px-3 py-1 mt-2 rounded"
    onClick={handleAsk}
  >
    Ask
  </button>

  <p className="mt-2 text-sm">{response}</p>

</div>


    );

}
