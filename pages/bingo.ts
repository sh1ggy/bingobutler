import data from "../sample.json"
import db from "../lib/db"

export default async function getServerSideProps(context:any) {
    const bingo = "111";
    // const res = await fetch(`https://bb.kongroo.xyz/${bingo}`);
    // const data = await res.json;
    // const games = await db
    //     .collection("games")
    //     .find({})
    //     .toArray();

    if (!data) {
        return {
            notFound: true,
        }
    }

    console.log(data.bingobutler.board1.cells[0]);
    // console.log(games);

    return {
        props: {},
    }
}