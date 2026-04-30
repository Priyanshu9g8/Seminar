import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
    {chapter:"Ch1",score:60},
    {chapter:"Ch2",score:75},
    {chapter:"Ch3",score:90},
    {chapter:"Ch4",score:85}
]

export default function ProgressGraph(){

    return(

        <LineChart width={500} height={300} data={data}>

            <XAxis dataKey="chapter" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#ccc"/>

            <Line type="monotone" dataKey="score" />

        </LineChart>

    )
}