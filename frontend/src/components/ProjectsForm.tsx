import type { Project } from '../types';

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const addProject = () => {
    onChange([
      ...data,
      {
        name: '',
        description: [''],
        techStack: [],
        link: '',
      },
    ]);
  };

  const removeProject = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addDescriptionBullet = (projIndex: number) => {
    const updated = [...data];
    updated[projIndex].description.push('');
    onChange(updated);
  };

  const removeDescriptionBullet = (projIndex: number, bulletIndex: number) => {
    const updated = [...data];
    updated[projIndex].description = updated[projIndex].description.filter((_, i) => i !== bulletIndex);
    onChange(updated);
  };

  const updateDescriptionBullet = (projIndex: number, bulletIndex: number, value: string) => {
    const updated = [...data];
    updated[projIndex].description[bulletIndex] = value;
    onChange(updated);
  };

  const addTechStackItem = (projIndex: number) => {
    const updated = [...data];
    const currentStack = updated[projIndex].techStack || [];
    updated[projIndex].techStack = [...currentStack, ''];
    onChange(updated);
  };

  const removeTechStackItem = (projIndex: number, techIndex: number) => {
    const updated = [...data];
    const currentStack = updated[projIndex].techStack || [];
    updated[projIndex].techStack = currentStack.filter((_, i) => i !== techIndex);
    onChange(updated);
  };

  const updateTechStackItem = (projIndex: number, techIndex: number, value: string) => {
    const updated = [...data];
    const currentStack = updated[projIndex].techStack || [];
    currentStack[techIndex] = value;
    updated[projIndex].techStack = currentStack;
    onChange(updated);
  };

  return (
    <section className="form-section">
      <h2>Projects</h2>
      
      {data.length === 0 && (
        <p className="help-text">No projects yet. Click "Add Project" to get started.</p>
      )}

      {data.map((project, projIndex) => (
        <div key={projIndex} className="experience-entry">
          <div className="entry-header">
            <h3>Project #{projIndex + 1}</h3>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removeProject(projIndex)}
              aria-label="Remove project"
            >
              Remove
            </button>
          </div>

          <div className="form-group">
            <label htmlFor={`project-name-${projIndex}`}>
              Project Name <span className="required">*</span>
            </label>
            <input
              id={`project-name-${projIndex}`}
              type="text"
              value={project.name}
              onChange={(e) => updateProject(projIndex, 'name', e.target.value)}
              placeholder="Project name"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Description <span className="required">*</span>
            </label>
            <p className="help-text">Add bullet points describing the project</p>
            
            {project.description.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="bullet-item">
                <textarea
                  value={bullet}
                  onChange={(e) => updateDescriptionBullet(projIndex, bulletIndex, e.target.value)}
                  placeholder="Project detail or achievement"
                  rows={2}
                  required
                />
                {project.description.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-small"
                    onClick={() => removeDescriptionBullet(projIndex, bulletIndex)}
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
              onClick={() => addDescriptionBullet(projIndex)}
            >
              + Add Bullet Point
            </button>
          </div>

          <div className="form-group">
            <label>Tech Stack</label>
            <p className="help-text">Technologies used in this project (optional)</p>
            
            {(project.techStack || []).length === 0 && (
              <p className="help-text">No technologies added yet.</p>
            )}

            <div className="skills-list">
              {(project.techStack || []).map((tech, techIndex) => (
                <div key={techIndex} className="skill-item">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => updateTechStackItem(projIndex, techIndex, e.target.value)}
                    placeholder="e.g., React, Python, Docker"
                  />
                  <button
                    type="button"
                    className="btn-remove-small"
                    onClick={() => removeTechStackItem(projIndex, techIndex)}
                    aria-label="Remove technology"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-add-bullet"
              onClick={() => addTechStackItem(projIndex)}
            >
              + Add Technology
            </button>
          </div>

          <div className="form-group">
            <label htmlFor={`project-link-${projIndex}`}>Project Link</label>
            <input
              id={`project-link-${projIndex}`}
              type="url"
              value={project.link || ''}
              onChange={(e) => updateProject(projIndex, 'link', e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={addProject}>
        + Add Project
      </button>
    </section>
  );
}
