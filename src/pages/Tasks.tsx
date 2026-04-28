import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Database } from '../types/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

type Task = Database['public']['Tables']['tasks']['Row'] & { project?: { name: string, color_tag: string | null } };

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('todo');

  const fetchTasks = async () => {
    try {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(name, color_tag)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // The join returns an array or single object depending on relation, but here it's n:1 so it's a single object
      setTasks(data as unknown as Task[]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    try {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message);
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'todo') return t.status !== 'Done';
    if (filter === 'done') return t.status === 'Done';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-500">Manage tasks across all your projects.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('todo')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'todo' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            To Do
          </button>
          <button 
            onClick={() => setFilter('done')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'done' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Done
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            All
          </button>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-gray-100">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No tasks found.</div>
          ) : (
            filteredTasks.map(task => (
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
                    {task.project && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${task.project.color_tag}20`, color: task.project.color_tag || '#000' }}>
                        {task.project.name}
                      </span>
                    )}
                  </div>
                  {task.due_date && (
                    <p className="text-xs text-gray-400 mt-1">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
