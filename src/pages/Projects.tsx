import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from '../hooks/useAuth';
import { ProjectCard } from '../components/ProjectCard';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectOption } from '../components/ui/select';
import { toast } from 'sonner';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<(Project & { tasks?: Task[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [chain, setChain] = useState('');
  const [stage, setStage] = useState('Upcoming');
  const [status, setStatus] = useState('Active');
  const [potentialValue, setPotentialValue] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [colorTag, setColorTag] = useState('#A8C538');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) throw tasksError;

      const projectsWithTasks = projectsData.map(p => ({
        ...p,
        tasks: tasksData.filter(t => t.project_id === p.id)
      }));

      setProjects(projectsWithTasks);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from('projects').insert([
        {
          user_id: user.id,
          name,
          description,
          chain,
          stage,
          status,
          potential_value: potentialValue,
          website_url: websiteUrl,
          twitter_url: twitterUrl,
          discord_url: discordUrl,
          color_tag: colorTag,
        }
      ]);

      if (error) throw error;

      toast.success('Project added successfully!');
      setOpen(false);
      resetForm();
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setChain('');
    setStage('Upcoming');
    setStatus('Active');
    setPotentialValue('');
    setWebsiteUrl('');
    setTwitterUrl('');
    setDiscordUrl('');
    setColorTag('#A8C538');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chain">Chain</Label>
                  <Select id="chain" value={chain} onChange={e => setChain(e.target.value)}>
                    <SelectOption value="">Select Chain</SelectOption>
                    <SelectOption value="Ethereum">Ethereum</SelectOption>
                    <SelectOption value="Solana">Solana</SelectOption>
                    <SelectOption value="Base">Base</SelectOption>
                    <SelectOption value="Arbitrum">Arbitrum</SelectOption>
                    <SelectOption value="Optimism">Optimism</SelectOption>
                    <SelectOption value="Sui">Sui</SelectOption>
                    <SelectOption value="Aptos">Aptos</SelectOption>
                    <SelectOption value="Other">Other</SelectOption>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select id="stage" value={stage} onChange={e => setStage(e.target.value)}>
                    <SelectOption value="Upcoming">Upcoming</SelectOption>
                    <SelectOption value="Testnet">Testnet</SelectOption>
                    <SelectOption value="Mainnet">Mainnet</SelectOption>
                    <SelectOption value="TGE Done">TGE Done</SelectOption>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" value={status} onChange={e => setStatus(e.target.value)}>
                    <SelectOption value="Active">Active</SelectOption>
                    <SelectOption value="Paused">Paused</SelectOption>
                    <SelectOption value="Completed">Completed</SelectOption>
                    <SelectOption value="Dropped">Dropped</SelectOption>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="potentialValue">Potential Value</Label>
                  <Input id="potentialValue" placeholder="e.g. High or $500" value={potentialValue} onChange={e => setPotentialValue(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input id="websiteUrl" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input id="twitterUrl" type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discordUrl">Discord URL</Label>
                  <Input id="discordUrl" type="url" value={discordUrl} onChange={e => setDiscordUrl(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorTag">Color Accent</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="colorTag" type="color" className="w-12 h-10 p-1" value={colorTag} onChange={e => setColorTag(e.target.value)} />
                    <Input type="text" value={colorTag} onChange={e => setColorTag(e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-64 rounded-2xl bg-white animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-gray-300 rounded-2xl">
          <p className="text-gray-500 mb-4">No projects yet — add your first airdrop!</p>
          <Button onClick={() => setOpen(true)}>Add Project</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
