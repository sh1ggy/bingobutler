import data from "../sample.json"
export default async function getServerSideProps(context:any) {
    const bingo = "111";
    // const res = await fetch(`https://bb.kongroo.xyz/${bingo}`);
    // const data = await res.json;

    if (!data) {
        return {
            notFound: true,
        }
    }

    console.log(data.bingobutler.board1.players[0]);

    return {
        props: {},
    }
}