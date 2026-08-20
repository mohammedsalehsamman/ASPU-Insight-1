import { Component } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiRefreshCw } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import '../styling/NotFound.css';

function ErrorFallback({ onRetry }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const content = t('errorBoundary', { returnObjects: true });

  return (
    <div className={`not-found-root theme-${theme} lang-${lang}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <main className="not-found-main">
        <div className="not-found-mark" aria-hidden="true">!</div>
        <div className="not-found-copy">
          <span className="not-found-kicker">{content.kicker}</span>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <div className="not-found-actions">
            <button type="button" className="not-found-primary" onClick={onRetry}>
              <FiRefreshCw size={16} />
              {content.retry}
            </button>
            <button type="button" className="not-found-secondary" onClick={() => { onRetry(); navigate('/'); }}>
              <FiHome size={16} />
              {content.home}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught render error:', error, info);
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
