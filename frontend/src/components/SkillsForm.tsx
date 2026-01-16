import type { Skills } from '../types';

interface SkillsFormProps {
  data: Skills;
  onChange: (data: Skills) => void;
}

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const addSkill = () => {
    onChange({
      skills: [...data.skills, ''],
    });
  };

  const removeSkill = (index: number) => {
    onChange({
      skills: data.skills.filter((_, i) => i !== index),
    });
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...data.skills];
    updated[index] = value;
    onChange({ skills: updated });
  };

  return (
    <section className="form-section">
      <h2>Skills</h2>
      <p className="help-text">Add your technical and professional skills as a flat list</p>
      
      {data.skills.length === 0 && (
        <p className="help-text">No skills added yet. Click "Add Skill" to get started.</p>
      )}

      <div className="skills-list">
        {data.skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <input
              type="text"
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              placeholder="e.g., JavaScript, Project Management, Python"
              required
            />
            <button
              type="button"
              className="btn-remove-small"
              onClick={() => removeSkill(index)}
              aria-label="Remove skill"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn-add" onClick={addSkill}>
        + Add Skill
      </button>
    </section>
  );
}
