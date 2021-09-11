import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import { useContext, useEffect } from "react";
import { connectToDatabase } from '../lib/db';
import { UserContext } from './_app';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const rt = ctx.query.rt;
  const { db } = await connectToDatabase();
  const user = await db
    .collection("users")
    .findOne({ rt });

  return {
    props: { user: JSON.parse(JSON.stringify(user)) }
  }
}

//@ts-ignore
const Auth: NextPage = ({ user }) => {
  const {setUser} = useContext(UserContext); 
  const router = useRouter();
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    const bookmark = localStorage.getItem("bookmark");
    if (bookmark) {
      localStorage.removeItem("bookmark");
      router.push(`/game/${bookmark}`)
    }
    else {
      router.push("/");
    }

  }, [])
  return (
    <div></div>
  )
}
export default Auth;