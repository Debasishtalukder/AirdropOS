import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Twitter, Disc as Discord, ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectOption } from '../components/ui/select';
import { toast } from 'sonner';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Resource = Database['public']['Tables']['resources']['Row'];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'resources'>('tasks');

  // Task Form Stat
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskIsRecurring, setTaskIsRecurring] = useState(false);
  const [taskRecurrence, setTaskRecurrence] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  
  // Resource Form State
  const [resourceOpen, setResourceOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState('Guide');

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      if (!id || !user) return;

      const { data: projectData, error: pError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (pError) throw pError;
      setProject(projectData);

      const { data: tasksData, error: tError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      if (tError) throw tError;
      setTasks(tasksData);

      const { data: resData, error: rError } = await supabase
        .from('resources')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      if (rError) throw rError;
      setResources(resData);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    try {
      const { error } = await supabase.from('tasks').insert([{
        project_id: id,
        user_id: user.id,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        is_recurring: taskIsRecurring,
        recurrence_type: taskIsRecurring ? taskRecurrence : null,
        due_date: taskDueDate || null,
        status: 'Todo'
      }]);
      if (error) throw error;
      toast.success('Task added');
      setTaskOpen(false);
      
      // Reset form
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('Medium');
      setTaskIsRecurring(false); setTaskRecurrence(''); setTaskDueDate('');
      
      fetchProjectData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    try {
      const { error } = await supabase.from('resources').insert([{
        project_id: id,
        user_id: user.id,
        title: resTitle,
        url: resUrl,
        type: resType
      }]);
      if (error) throw error;
      toast.success('Resource added');
      setResourceOpen(false);
      setResTitle(''); setResUrl(''); setResType('Guide');
      fetchProjectData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
    } catch (err: any) {
      toast.error(err.message);
      fetchProjectData(); // Revert
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast.success('Task deleted');
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex flex-col gap-4">
      <div className="h-20 bg-gray-200 rounded-xl w-full"></div>
      <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
    </div>;
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {project.chain && <Badge variant="secondary">{project.chain}</Badge>}
            {project.stage && <Badge variant="secondary">{project.stage}</Badge>}
            {project.potential_value && (
              <span className="flex items-center bg-lime-50 text-lime-700 px-2 py-0.5 rounded-full font-medium text-xs border border-lime-200">
                Potential: {project.potential_value}
              </span>
            )}
          </div>
          {project.description && (
            <p className="mt-4 text-gray-600 max-w-3xl">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {project.website_url && (
            <Button variant="outline" size="icon" asChild>
              <a href={project.website_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
            </Button>
          )}
          {project.twitter_url && (
            <Button variant="outline" size="icon" asChild>
              <a href={project.twitter_url} target="_blank" rel="noopener noreferrer"><Twitter className="h-4 w-4" /></a>
            </Button>
          )}
          {project.discord_url && (
            <Button variant="outline" size="icon" asChild>
              <a href={project.discord_url} target="_blank" rel="noopener noreferrer"><Discord className="h-4 w-4" /></a>
            </Button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tasks' ? 'border-lime-500 text-lime-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'resources' ? 'border-lime-500 text-lime-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resources ({resources.length})
          </button>
        </nav>
      </div>

      {activeTab === 'tasks' && (
        <Card className="shadow-sm border-gray-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Project Tasks</h3>
            <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="t-title">Title <span className="text-red-500">*</span></Label>
                    <Input id="t-title" required value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="t-desc">Description</Label>
                    <Textarea id="t-desc" value={taskDesc} onChange={e=>setTaskDesc(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="t-prio">Priority</Label>
                      <Select id="t-prio" value={taskPriority} onChange={e=>setTaskPriority(e.target.value)}>
                        <SelectOption value="Low">Low</SelectOption>
                        <SelectOption value="Medium">Medium</SelectOption>
                        <SelectOption value="High">High</SelectOption>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-due">Due Date</Label>
                      <Input type="date" id="t-due" value={taskDueDate} onChange={e=>setTaskDueDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="t-rec" checked={taskIsRecurring} onCheckedChange={(c) => setTaskIsRecurring(c as boolean)} />
                    <Label htmlFor="t-rec" className="font-normal">This is a recurring task</Label>
                  </div>
                  {taskIsRecurring && (
                    <div className="space-y-2">
                      <Label htmlFor="t-rectype">Recurrence Type</Label>
                      <Select id="t-rectype" value={taskRecurrence} onChange={e=>setTaskRecurrence(e.target.value)} required>
                        <SelectOption value="">Select...</SelectOption>
                        <SelectOption value="Daily">Daily</SelectOption>
                        <SelectOption value="Weekly">Weekly</SelectOption>
                        <SelectOption value="Monthly">Monthly</SelectOption>
                      </Select>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Task</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No tasks yet.</div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors group">
                  <Checkbox 
                    checked={task.status === 'Done'} 
                    onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                    className="w-5 h-5 rounded border-2 border-gray-300 bg-white flex-shrink-0 group-hover:border-lime-500 data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                      {task.priority === 'High' && <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">High</Badge>}
                      {task.priority === 'Low' && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Low</Badge>}
                      {task.is_recurring && <Badge variant="outline" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700 border-blue-200">{task.recurrence_type}</Badge>}
                    </div>
                    {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                    {task.due_date && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteTask(task.id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Important Links & Guides</h3>
            <Dialog open={resourceOpen} onOpenChange={setResourceOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Resource</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Resource</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddResource} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="r-title">Title <span className="text-red-500">*</span></Label>
                    <Input id="r-title" required value={resTitle} onChange={e=>setResTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-url">URL <span className="text-red-500">*</span></Label>
                    <Input id="r-url" type="url" required value={resUrl} onChange={e=>setResUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-type">Type</Label>
                    <Select id="r-type" value={resType} onChange={e=>setResType(e.target.value)}>
                      <SelectOption value="Guide">Guide</SelectOption>
                      <SelectOption value="Twitter">Twitter Link</SelectOption>
                      <SelectOption value="Discord">Discord Message</SelectOption>
                      <SelectOption value="Video">Video</SelectOption>
                      <SelectOption value="Other">Other</SelectOption>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setResourceOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Resource</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.length === 0 ? (
              <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                No resources added. Keep your guides here!
              </div>
            ) : (
              resources.map(res => (
                <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <Card className="h-full hover:border-lime-500 transition-colors">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-lime-50 transition-colors">
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-lime-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{res.title}</h4>
                        <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0">{res.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
