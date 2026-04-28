import { Link } from 'react-router-dom';
import { MoreVertical, ExternalLink, Twitter, Disc as Discord, CheckSquare } from 'lucide-react';
import { Database } from '../../types/supabase';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

interface ProjectCardProps {
  project: Project & { tasks?: Task[] };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'Done').length || 0;
  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Paused': return 'warning';
      case 'Completed': return 'info';
      case 'Dropped': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-lime-500 transition-all flex flex-col h-[280px] shadow-sm relative overflow-hidden group">
      <div 
        className="absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity" 
        style={{ backgroundColor: project.color_tag || '#A8C538' }} 
      />
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex gap-2 mb-2">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">{project.chain || 'ALL'}</span>
            <span className="px-2 py-0.5 bg-lime-50 text-lime-700 text-[10px] font-bold rounded uppercase tracking-wider">{project.stage || 'NEW'}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{project.name}</h3>
        </div>
        <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center -mr-2 ring-1 ring-gray-100 shadow-sm z-10 shrink-0 font-bold text-xs text-white ${project.status === 'Active' ? 'bg-lime-500' : 'bg-gray-400'}`}>
          {project.name.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed flex-1">
        {project.description || 'No description provided.'}
      </p>
      
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-gray-500">Tasks</span>
          <span className={progress === 100 ? 'text-lime-600' : 'text-gray-900'}>{completedTasks}/{totalTasks} done</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-lime-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex -space-x-1">
             {/* Fake team avatars just for aesthetics in design, if empty we can leave it or put icons */}
             {project.website_url && (
                <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center hover:bg-gray-200 z-30 transition-colors">
                  <ExternalLink className="h-3 w-3 text-gray-500" />
                </a>
             )}
             {project.twitter_url && (
                <a href={project.twitter_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center hover:bg-gray-200 z-20 transition-colors">
                  <Twitter className="h-3 w-3 text-gray-500" />
                </a>
             )}
             {(!project.website_url && !project.twitter_url) && (
               <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center z-10 text-[8px] text-gray-400">...</div>
             )}
          </div>
          <Link to={`/projects/${project.id}`} className="text-sm font-bold text-gray-900 hover:text-lime-600 transition-colors">
            Manage &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
