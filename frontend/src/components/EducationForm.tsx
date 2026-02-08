import type { Education } from '../types';

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export function EducationForm({ data, onChange }: EducationFormProps) {
  const addEducation = () => {
    onChange([
      ...data,
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        cgpa: '',
        relevantCourseWorks: [],
      },
    ]);
  };

  const removeEducation = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string | string[]) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateCourseWorks = (index: number, value: string) => {
    const courses = value.split(',').map(c => c.trim()).filter(c => c.length > 0);
    updateEducation(index, 'relevantCourseWorks', courses);
  };

  return (
    <section className="form-section">
      <h2>Education</h2>
      
      {data.length === 0 && (
        <p className="help-text">No education entries yet. Click "Add Education" to get started.</p>
      )}

      {data.map((edu, index) => (
        <div key={index} className="experience-entry">
          <div className="entry-header">
            <h3>Education #{index + 1}</h3>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removeEducation(index)}
              aria-label="Remove education entry"
            >
              Remove
            </button>
          </div>

          <div className="form-group">
            <label htmlFor={`institution-${index}`}>
              Institution <span className="required">*</span>
            </label>
            <input
              id={`institution-${index}`}
              type="text"
              value={edu.institution}
              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              placeholder="University or school name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor={`degree-${index}`}>
              Degree <span className="required">*</span>
            </label>
            <input
              id={`degree-${index}`}
              type="text"
              value={edu.degree}
              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              placeholder="e.g., Bachelor of Science, Master of Arts"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor={`fieldOfStudy-${index}`}>Field of Study</label>
            <input
              id={`fieldOfStudy-${index}`}
              type="text"
              value={edu.fieldOfStudy || ''}
              onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
              placeholder="e.g., Computer Science, Business Administration"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`edu-startDate-${index}`}>
                Start Date <span className="required">*</span>
              </label>
              <input
                id={`edu-startDate-${index}`}
                type="text"
                value={edu.startDate}
                onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                placeholder="MM/YYYY"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`edu-endDate-${index}`}>End Date</label>
              <input
                id={`edu-endDate-${index}`}
                type="text"
                value={edu.endDate || ''}
                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                placeholder="MM/YYYY or 'Expected MM/YYYY'"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={`cgpa-${index}`}>CGPA / GPA</label>
            <input
              id={`cgpa-${index}`}
              type="text"
              value={edu.cgpa || ''}
              onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
              placeholder="e.g., 3.8/4.0 or 8.5/10"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`courseWorks-${index}`}>Relevant Courseworks</label>
            <input
              id={`courseWorks-${index}`}
              type="text"
              value={edu.relevantCourseWorks?.join(', ') || ''}
              onChange={(e) => updateCourseWorks(index, e.target.value)}
              placeholder="Enter comma-separated courses, e.g., Data Structures, Algorithms, Machine Learning"
            />
            <span className="help-text">Separate courses with commas</span>
          </div>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={addEducation}>
        + Add Education
      </button>
    </section>
  );
}
