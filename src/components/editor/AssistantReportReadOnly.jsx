// ← خاص بصفحة "المحرر": عرض للقراءة فقط لتقرير مساعد المحرر (assistant_editor_report)
// بعكس صفحة المساعد نفسه، المحرر ما بيقدر يعدّل هالتقرير، بس يشوفه
export default function AssistantReportReadOnly({ activePaper, t }) {
  return (
    <div className="editor-field">
      <label className="editor-label">{t('assistant_report')}</label>
      <div className="assistant-report-box">
        {activePaper?.assistant_editor_report ? activePaper.assistant_editor_report : t('no_notes')}
      </div>
    </div>
  );
}
