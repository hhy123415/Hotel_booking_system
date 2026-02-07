import styles from "../css/Home.module.css";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

function Home() {
  const { auth } = useAuth();

  return (
    <div className={styles.container}>
      {/* 未登录状态*/}
      {!auth.isLoggedIn && (
        <div className={styles.card}>
          <h1 className={styles.title}>请先登录以正常使用功能</h1>
          <p className={styles.subtitle}>登录后您可以访问完整的功能和服务</p>
          <div className={styles.actionArea}>
            <Link to="/login" className={styles.loginBtn}>
              立即登录
            </Link>
          </div>
        </div>
      )}
      {/* 已登录状态 */}
      {auth.isLoggedIn && (
        <div className={styles.dashboardCard}>
          <div className={styles.header}>
            <p className={styles.title}>请选择您要执行的操作</p>
          </div>

          <div className={styles.grid}>
            {auth.isAdmin ? (
              /* 管理员功能区 */
              <>
                <Link
                  to="/query"
                  className={`${styles.menuBtn} ${styles.adminTheme}`}
                >
                  <span className={styles.icon}>🔍</span>
                  查询信息
                </Link>
                <Link
                  to="/audit"
                  className={`${styles.menuBtn} ${styles.adminTheme}`}
                >
                  <span className={styles.icon}>📋</span>
                  审核发布
                </Link>
              </>
            ) : (
              /* 普通用户功能区 */
              <>
                <Link
                  to="/new-request"
                  className={`${styles.menuBtn} ${styles.userTheme}`}
                >
                  <span className={styles.icon}>➕</span>
                  新的申请
                </Link>
                <Link
                  to="/my-pending"
                  className={`${styles.menuBtn} ${styles.userTheme}`}
                >
                  <span className={styles.icon}>⏳</span>
                  我的待审核申请
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
