import { FaFileAlt, FaSearch, FaFlagCheckered, FaCheck } from 'react-icons/fa';

function getStepDotCls(stepIndex, status) {
  const activeIdx = status === 'pending' ? 1 : 2;
  if (stepIndex === 0) return 'pd-st-dot--done';
  if (stepIndex < activeIdx) return 'pd-st-dot--done';
  if (stepIndex === activeIdx) return 'pd-st-dot--active';
  return 'pd-st-dot--idle';
}

export default function StatusTimeline({ paper, t }) {
  const steps = [
    {
      name: t('timeline_submitted'),
      sub: t('timeline_submitted_sub'),
      icon: <FaFileAlt />,
    },
    {
      name: t('timeline_review'),
      sub: t('timeline_review_sub'),
      icon: <FaSearch />,
    },
    {
      name: t('timeline_decision'),
      sub:
        paper.status === 'approved' ? t('timeline_decision_approved')
        : paper.status === 'rejected' ? t('timeline_decision_rejected')
        : t('timeline_decision_pending'),
      icon: <FaFlagCheckered />,
    },
  ];

  return (
    <div className="pd-meta-card">
      <div className="pd-section-label">{t('status_track_label')}</div>
      <div className="pd-status-track">
        {steps.map((step, i) => {
          const dotCls = getStepDotCls(i, paper.status);

          return (
            <div className="pd-st-step" key={i}>
              <div className={`pd-st-dot ${dotCls}`}>
                {dotCls === 'pd-st-dot--done' ? <FaCheck /> : step.icon}
              </div>
              <div className="pd-st-info">
                <div className="pd-st-name">{step.name}</div>
                <div className="pd-st-sub">{step.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
