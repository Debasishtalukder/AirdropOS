import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Pencil, ExternalLink, Twitter, Disc as Discord } from 'lucide-react';
import { Database } from '../../types/supabase';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

interface ProjectCardProps {
  project: Project & { tasks?: Task[] };
  onRemove?: (projectId: string) => void;
  onUpdate?: (updatedProject: Project) => void;
}

export function ProjectCard({ project, onRemove, onUpdate }: ProjectCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: project.name,
    description: project.description || '',
    chain: project.chain || '',
    stage: project.stage || '',
    status: project.status || '',
    website_url: project.website_url || '',
    twitter_url: project.twitter_url || '',
    discord_url: project.discord_url || '',
    color_tag: project.color_tag || '#A8C538',
  });

  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'Done').length || 0;
  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: form.name.trim(),
          description: form.description.trim() || null,
          chain: form.chain.trim() || null,
          stage: form.stage.trim() || null,
          status: form.status.trim() || null,
          website_url: form.website_url.trim() || null,
          twitter_url: form.twitter_url.trim() || null,
          discord_url: form.discord_url.trim() || null,
          color_tag: form.color_tag || null,
        })
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Project updated!');
      onUpdate?.(data);
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      toast.success('Project removed');
      onRemove?.(project.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove project');
    }
    setConfirmRemoveOpen(false);
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-lime-500 transition-all flex flex-col h-[280px] shadow-sm relative overflow-hidden group">
        <div
          className="absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: project.color_tag || '#A8C538' }}
        />

        {/* Action buttons — visible on hover */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={(e) => { e.preventDefault(); setEditOpen(true); }}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-lime-100 flex items-center justify-center transition-colors"
            title="Edit project"
            aria-label="Edit project"
          >
            <Pencil className="h-3.5 w-3.5 text-gray-600" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setConfirmRemoveOpen(true); }}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors"
            title="Remove project"
            aria-label="Remove project"
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div>

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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Customize the details for this project card.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project Name *</Label>
              <Input id="edit-name" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Project name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea id="edit-desc" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Brief description..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-chain">Chain</Label>
                <Input id="edit-chain" value={form.chain} onChange={e => updateField('chain', e.target.value)} placeholder="e.g. ETH, SOL" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stage">Stage</Label>
                <Input id="edit-stage" value={form.stage} onChange={e => updateField('stage', e.target.value)} placeholder="e.g. Testnet, Mainnet" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Input id="edit-status" value={form.status} onChange={e => updateField('status', e.target.value)} placeholder="e.g. Active, Paused" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color Tag</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="edit-color"
                    value={form.color_tag}
                    onChange={e => updateField('color_tag', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span className="text-xs text-gray-500">{form.color_tag}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Website URL</Label>
              <Input id="edit-website" value={form.website_url} onChange={e => updateField('website_url', e.target.value)} placeholder="https://..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-twitter">Twitter URL</Label>
                <Input id="edit-twitter" value={form.twitter_url} onChange={e => updateField('twitter_url', e.target.value)} placeholder="https://twitter.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discord">Discord URL</Label>
                <Input id="edit-discord" value={form.discord_url} onChange={e => updateField('discord_url', e.target.value)} placeholder="https://discord.gg/..." />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-lime-500 hover:bg-lime-600 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <Dialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{project.name}</strong>? This will permanently delete the project and all its tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemoveOpen(false)}>Cancel</Button>
            <Button onClick={handleRemove} className="bg-red-500 hover:bg-red-600 text-white">
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
