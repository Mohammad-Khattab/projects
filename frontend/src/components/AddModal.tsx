import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  tags?: string;
  createdAt: string;
}

interface AddModalProps {
  type: 'game' | 'website';
  onAdd: (project: Project) => void;
  onClose: () => void;
}

export default function AddModal({ type, onAdd, onClose }: AddModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const label = type === 'game' ? 'Game' : 'Website';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { name?: string; description?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      url: url.trim() || undefined,
      tags: tags.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add {label}</h2>
          <button className="delete-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`${label} name`}
              autoFocus
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="field">
            <label>Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={`Describe your ${type}...`}
              rows={3}
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>
          <div className="field">
            <label>URL <span className="optional">(optional)</span></label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="field">
            <label>Tags <span className="optional">(optional, comma-separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. React, TypeScript, 2D"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add {label}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
