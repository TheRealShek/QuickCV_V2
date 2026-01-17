import type { ProfessionalSummary } from '../types';

interface SummaryFormProps {
  data: ProfessionalSummary;
  onChange: (data: ProfessionalSummary) => void;
}

export function SummaryForm({ data, onChange }: SummaryFormProps) {
  const handleChange = (value: string) => {
    onChange({ summary: value });
  };

  return (
    <section className="form-section">
      <h2>Professional Summary</h2>
      
      <div className="form-group">
        <label htmlFor="summary">
          Summary (2-4 sentences) <span className="required">*</span>
        </label>
        <textarea
          id="summary"
          value={data.summary}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Experienced software developer with 8 years in full-stack development. Passionate about building scalable systems and mentoring teams."
          rows={4}
          required
        />
        <small className="help-text">
          Brief professional summary highlighting your experience and expertise
        </small>
      </div>
    </section>
  );
}
