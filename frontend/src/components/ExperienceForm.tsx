import type { WorkExperience } from '../types';

interface ExperienceFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export function ExperienceForm({ data, onChange }: ExperienceFormProps) {
  const addExperience = () => {
    onChange([
      ...data,
      {
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        description: [''],
      },
    ]);
  };

  const removeExperience = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string | string[]) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addDescriptionBullet = (expIndex: number) => {
    const updated = [...data];
    updated[expIndex].description.push('');
    onChange(updated);
  };

  const removeDescriptionBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...data];
    updated[expIndex].description = updated[expIndex].description.filter((_, i) => i !== bulletIndex);
    onChange(updated);
  };

  const updateDescriptionBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const updated = [...data];
    updated[expIndex].description[bulletIndex] = value;
    onChange(updated);
  };

  return (
    <section className="form-section">
      <h2>Work Experience</h2>
      
      {data.length === 0 && (
        <p className="help-text">No experience entries yet. Click "Add Experience" to get started.</p>
      )}

      {data.map((exp, expIndex) => (
        <div key={expIndex} className="experience-entry">
          <div className="entry-header">
            <h3>Experience #{expIndex + 1}</h3>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removeExperience(expIndex)}
              aria-label="Remove experience entry"
            >
              Remove
            </button>
          </div>

          <div className="form-group">
            <label htmlFor={`company-${expIndex}`}>
              Company <span className="required">*</span>
            </label>
            <input
              id={`company-${expIndex}`}
              type="text"
              value={exp.company}
              onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
              placeholder="Company name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor={`role-${expIndex}`}>
              Role <span className="required">*</span>
            </label>
            <input
              id={`role-${expIndex}`}
              type="text"
              value={exp.role}
              onChange={(e) => updateExperience(expIndex, 'role', e.target.value)}
              placeholder="Job title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor={`exp-location-${expIndex}`}>Location</label>
            <input
              id={`exp-location-${expIndex}`}
              type="text"
              value={exp.location || ''}
              onChange={(e) => updateExperience(expIndex, 'location', e.target.value)}
              placeholder="City, State/Country"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`startDate-${expIndex}`}>
                Start Date <span className="required">*</span>
              </label>
              <input
                id={`startDate-${expIndex}`}
                type="text"
                value={exp.startDate}
                onChange={(e) => updateExperience(expIndex, 'startDate', e.target.value)}
                placeholder="MM/YYYY"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`endDate-${expIndex}`}>End Date</label>
              <input
                id={`endDate-${expIndex}`}
                type="text"
                value={exp.endDate || ''}
                onChange={(e) => updateExperience(expIndex, 'endDate', e.target.value)}
                placeholder="MM/YYYY or 'Present'"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Description <span className="required">*</span>
            </label>
            <p className="help-text">Add bullet points describing your responsibilities and achievements</p>
            
            {exp.description.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="bullet-item">
                <textarea
                  value={bullet}
                  onChange={(e) => updateDescriptionBullet(expIndex, bulletIndex, e.target.value)}
                  placeholder="Achievement or responsibility"
                  rows={2}
                  required
                />
                {exp.description.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-small"
                    onClick={() => removeDescriptionBullet(expIndex, bulletIndex)}
                    aria-label="Remove bullet point"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="btn-add-bullet"
              onClick={() => addDescriptionBullet(expIndex)}
            >
              + Add Bullet Point
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={addExperience}>
        + Add Experience
      </button>
    </section>
  );
}
