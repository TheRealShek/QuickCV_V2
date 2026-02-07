import type { SectionKey } from '../types';

interface SectionReorderProps {
  sectionOrder: SectionKey[];
  onChange: (order: SectionKey[]) => void;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  contact: 'Contact Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  experienceProjects: 'Experience & Projects',
};

export function SectionReorder({ sectionOrder, onChange }: SectionReorderProps) {
  const moveUp = (index: number) => {
    if (index <= 1) return; // Can't move contact (0) or move above contact
    const newOrder = [...sectionOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onChange(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === 0 || index >= sectionOrder.length - 1) return; // Can't move contact or last item
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onChange(newOrder);
  };

  const resetOrder = () => {
    onChange(['contact', 'summary', 'experience', 'education', 'skills', 'projects']);
  };

  return (
    <section className="form-section section-reorder">
      <h2>Section Order</h2>
      <p className="help-text">
        Customize the order of sections in your resume. Contact Information must remain first.
      </p>

      <div className="section-order-list">
        {sectionOrder.map((section, index) => (
          <div key={section} className="section-order-item">
            <span className="section-number">{index + 1}</span>
            <span className="section-label">{SECTION_LABELS[section]}</span>
            <div className="section-controls">
              <button
                type="button"
                className="btn-reorder"
                onClick={() => moveUp(index)}
                disabled={index === 0 || index === 1}
                aria-label="Move section up"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="btn-reorder"
                onClick={() => moveDown(index)}
                disabled={index === 0 || index === sectionOrder.length - 1}
                aria-label="Move section down"
                title="Move down"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-reset" onClick={resetOrder}>
        Reset to Default Order
      </button>
    </section>
  );
}
