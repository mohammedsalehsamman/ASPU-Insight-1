import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import "../styling/Footer.css"

export default function Footer({ isAr, footer, Logo }) {
  const { t } = useTranslation();
  const shared = t('shared', { returnObjects: true });
  return (
    <footer className="aspu-footer">
      <div className="aspu-ft-grid">
        <div className="aspu-ft-brand">
          <div className="aspu-ft-brand-logo">
            <Logo size={36} />
            <div>
              <div className="aspu-logo-n">ASPU Insight</div>
              <div className="aspu-logo-s">
                {shared.logoTagline}
              </div>
            </div>
          </div>
          <p>{footer.brand}</p>
        </div>
        {footer.cols.map((col, i) => (
          <div key={i} className="aspu-ft-col">
            <h5>{col.title}</h5>
            <ul>
              {col.links.map((link, j) => (
                <li key={j}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="aspu-ft-btm">
        <span>{footer.copy}</span>
        <span>{footer.sub}</span>
      </div>
    </footer>
  );
}