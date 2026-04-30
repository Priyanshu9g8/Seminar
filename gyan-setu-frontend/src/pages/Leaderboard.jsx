export default function Leaderboard(){

    const scoreData = JSON.parse(localStorage.getItem("lastScore"))

    if(!scoreData){
        return <div className="p-10">No quiz results yet.</div>
    }

    return (

        <div className="p-10">

            <h1 className="text-2xl font-bold mb-6">
                Leaderboard
            </h1>

            <p>
                Score: {scoreData.score} / {scoreData.total}
            </p>

            <p>
                Date: {scoreData.date}
            </p>

        </div>

    )
}