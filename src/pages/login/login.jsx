import styles from './login.module.css';
import { MdRocketLaunch, MdTrendingUp, MdPersonAdd } from "react-icons/md";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const enviarDatos = async (e) => {
    // Evita que la página se recargue al presionar Enter o el botón
    if (e) e.preventDefault();

    try {
      const response = await axios.post(
        "https://api.ramosgrupo.lat/api/login/",
        {
          email: email,
          password: password
        }
      );
      sessionStorage.setItem("nombre", response.data.nombre);
      sessionStorage.setItem("rol", response.data.rol);
      sessionStorage.setItem("id_usuario", response.data.id_usuario);

      if (response.data.rol === "ADMIN") {
        navigate("/inicio");
      } else if (response.data.rol === "ASESOR") {
        navigate("/asesores");
      }

    } catch (error) {
      console.log(error);
    }
  };

  const actualzarEmail = (e) => {
    setEmail(e.target.value);
  };

  const actualzarPassword = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className={styles.wrapper}>
      {/* Left Side: Login Form */}
      <div className={styles.formPanel}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <span className={`${styles.materialIcon} material-symbols-outlined`}><MdRocketLaunch className={styles.iconCustom} /></span>
          </div>
          <h1 className={styles.logoText}>
            Nexus<span className={styles.logoAccent}>CRM</span>
          </h1>
        </div>

        {/* Form Body */}
        <div className={styles.formBody}>
          <div className={styles.formHeading}>
            <h2 className={styles.formTitle}>¡Bienvenido!</h2>
            <p className={styles.formSubtitle}>
              Ingrese sus credenciales para acceder a su espacio de trabajo.
            </p>
          </div>

          {/* Se agrega onSubmit para capturar el Enter */}
          <form className={styles.form} onSubmit={enviarDatos}>
            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={actualzarEmail}
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <a className={styles.forgotLink} href="#">Forgot?</a>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  className={`${styles.input} ${styles.inputPassword}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={actualzarPassword}
                />
                <button className={styles.visibilityBtn} type="button" onClick={() => setShowPassword(!showPassword)}>
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Se cambia a type="submit" para que el formulario reconozca la acción */}
            <button className={styles.submitBtn} type="submit">
              Ingresar al espacio de trabajo
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>Or continue with SSO</span>
            <div className={styles.dividerLine} />
          </div>

          {/* SSO Buttons */}
          <div className={styles.ssoGrid}>
            <button className={styles.ssoBtn} type="button">
              <img
                className={styles.ssoLogo}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVP4lDMUV-JoMxOZIG6-oIe4dtdkOaW7eBda5LVYU5OY-cn30Mo9794yvT3oxoYr_72gzTHBAbx9JkkR2s4GtyJVWYYLbUJxK8fUytL4-el9y-i9DT3W68jBzgP5YkEQ7fsLBagwYTjoE4l7edN1B8-D3e6J0zERYEx7xtyL07rNidTuVFEgNORNK64qQhvHycAjwUYFQfP0jQczoPlL2PzXeAXgj9exi68GOm2NWAWQD0RRl1uEf9heWKZqvIa1BqsYmqRrDt51F5"
                alt="Google Logo"
              />
              <span className={styles.ssoBtnText}>Google</span>
            </button>
            <button className={styles.ssoBtn} type="button">
              <span className={`${styles.ssoTerminalIcon} material-symbols-outlined`}>terminal</span>
              <span className={styles.ssoBtnText}>Okta</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>© 2024 Nexus CRM Inc.</p>
          <div className={styles.footerLinks}>
            <a className={styles.footerLink} href="#">Privacy</a>
            <a className={styles.footerLink} href="#">Terms</a>
            <a className={styles.footerLink} href="#">Contact</a>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Dashboard */}
      <div className={styles.visualPanel}>
        <div className={`${styles.glow} ${styles.glowPurple}`} />
        <div className={`${styles.glow} ${styles.glowBlue}`} />

        <div className={`${styles.glass} ${styles.dashboardCard}`}>
          <div className={styles.mockHeader}>
            <div className={styles.trafficLights}>
              <div className={`${styles.dot} ${styles.dotRed}`} />
              <div className={`${styles.dot} ${styles.dotYellow}`} />
              <div className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <div className={styles.mockSearchBar} />
            <div className={styles.mockAvatar} />
          </div>

          <div className={styles.mockBody}>
            <div className={styles.mockSidebar}>
              <div className={`${styles.sidebarIcon} ${styles.sidebarIconActive}`}>
                <span className="material-symbols-outlined">dashboard</span>
              </div>
              <div className={styles.sidebarIcon}>
                <span className={`${styles.sidebarIconInactive} material-symbols-outlined`}>analytics</span>
              </div>
              <div className={styles.sidebarIcon}>
                <span className={`${styles.sidebarIconInactive} material-symbols-outlined`}>group</span>
              </div>
              <div className={styles.sidebarIcon}>
                <span className={`${styles.sidebarIconInactive} material-symbols-outlined`}>settings</span>
              </div>
            </div>

            <div className={styles.mockMain}>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Total Revenue</div>
                  <div className={styles.metricValue}>$124,500</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Active Leads</div>
                  <div className={styles.metricValue}>1,240</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Conversion</div>
                  <div className={styles.metricValue}>24.8%</div>
                </div>
              </div>

              <div className={styles.chartArea}>
                <div className={styles.chartHeader}>
                  <div className={styles.chartTitlePlaceholder} />
                  <div className={styles.chartFilterPlaceholder} />
                </div>
                <div className={styles.bars}>
                  {[40, 60, 45, 80, 55, 70, 95, 75, 50].map((h, i) => (
                    <div
                      key={i}
                      className={`${styles.bar} ${i === 6 ? styles.barPrimary :
                        i === 7 || i === 8 ? styles.barPurple :
                          i === 3 ? styles.barBlueBright : styles.barBlue
                        }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.glass} ${styles.floatingCardTopRight}`}>
          <div className={styles.floatingCardIcon} style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
            <span className="material-symbols-outlined"><MdTrendingUp className="material-symbols-outlined" size="1.5em" /></span>
          </div>
          <div>
            <div className={styles.floatingCardLabel}>Conversion Rate</div>
            <div className={styles.floatingCardValue}>+12.4%</div>
          </div>
        </div>

        <div className={`${styles.glass} ${styles.floatingCardBottomLeft}`}>
          <div className={styles.floatingCardIcon} style={{ background: 'rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
            <span className="material-symbols-outlined"><MdPersonAdd size="1.4em" className="tu-clase-personalizada" /></span>
          </div>
          <div>
            <div className={styles.floatingCardLabel}>New Leads</div>
            <div className={styles.floatingCardValue}>1,240</div>
          </div>
        </div>

        <div className={`${styles.glass} ${styles.radialProgress}`}>
          <svg className={styles.radialSvg} viewBox="0 0 160 160">
            <circle className={styles.radialTrack} cx="80" cy="80" r="70" />
            <circle className={styles.radialFill} cx="80" cy="80" r="70" />
          </svg>
          <div className={styles.radialCenter}>
            <span className={styles.radialPercent}>75%</span>
            <span className={styles.radialLabel}>Target</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;