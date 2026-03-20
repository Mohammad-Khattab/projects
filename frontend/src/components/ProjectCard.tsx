interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  tags?: string;
  createdAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const date = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{project.name}</h3>
        <button className="delete-btn" onClick={() => onDelete(project.id)} title="Remove">×</button>
      </div>
      <p className="card-desc">{project.description}</p>
      {project.tags && (
        <div className="card-tags">
          {project.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
      <div className="card-footer">
        <span className="card-date">{date}</span>
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="visit-btn">
            Visit →
          </a>
        )}
      </div>
    </div>
  );
}
