// import styles from '../css/Home.module.css'
import { useAuth } from "../hooks/useAuth";

function Home() {

  const {auth} = useAuth();

  return (
    <>
      {!auth.isLoggedIn && <h1>请先登录以正常使用功能</h1>}
    </>
  )
}

export default Home;
