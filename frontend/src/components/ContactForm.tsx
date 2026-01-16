import type { ContactInfo } from '../types';

interface ContactFormProps {
  data: ContactInfo;
  onChange: (data: ContactInfo) => void;
}

export function ContactForm({ data, onChange }: ContactFormProps) {
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <section className="form-section">
      <h2>Contact Information</h2>
      
      <div className="form-group">
        <label htmlFor="fullName">
          Full Name <span className="required">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          value={data.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="John Smith"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email <span className="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="john.smith@example.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">
          Phone <span className="required">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+1-555-0100"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">
          Location <span className="required">*</span>
        </label>
        <input
          id="location"
          type="text"
          value={data.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="New York, NY"
          required
        />
      </div>

      <h3>Optional Links</h3>

      <div className="form-group">
        <label htmlFor="linkedin">LinkedIn</label>
        <input
          id="linkedin"
          type="text"
          value={data.linkedin || ''}
          onChange={(e) => handleChange('linkedin', e.target.value)}
          placeholder="linkedin.com/in/johnsmith"
        />
      </div>

      <div className="form-group">
        <label htmlFor="github">GitHub</label>
        <input
          id="github"
          type="text"
          value={data.github || ''}
          onChange={(e) => handleChange('github', e.target.value)}
          placeholder="github.com/johnsmith"
        />
      </div>

      <div className="form-group">
        <label htmlFor="portfolio">Portfolio</label>
        <input
          id="portfolio"
          type="text"
          value={data.portfolio || ''}
          onChange={(e) => handleChange('portfolio', e.target.value)}
          placeholder="johnsmith.dev"
        />
      </div>

      <div className="form-group">
        <label htmlFor="twitter">Twitter</label>
        <input
          id="twitter"
          type="text"
          value={data.twitter || ''}
          onChange={(e) => handleChange('twitter', e.target.value)}
          placeholder="twitter.com/johnsmith"
        />
      </div>
    </section>
  );
}
