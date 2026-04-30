import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ProjectCard } from '../components/ProjectCard';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Database } from '../types/supabase';
import { Link } from 'react-router-dom';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'] & { project_name?: string };

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  });
  const [myProjects, setMyProjects] = useState<(Project & { tasks?: any[] })[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [projectProgress, setProjectProgress] = useState<{name: string, progress: number, done: number, total: number}[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      try {
        // Fetch projects
        const { data: projectsData, error: pError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        if (pError) throw pError;

        // Fetch tasks
        const { data: tasksData, error: tError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        if (tError) throw tError;

        const totalProjects = projectsData.length;
        const activeProjects = projectsData.filter(p => p.status === 'Active').length;
        const totalTasks = tasksData.length;
        const completedTasks = tasksData.filter(t => t.status === 'Done').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setStats({ totalProjects, activeProjects, totalTasks, completedTasks, completionRate });

        // Map tasks to projects
        const projectsWithTasks = projectsData.slice(0, 4).map(p => ({
          ...p,
          tasks: tasksData.filter(t => t.project_id === p.id)
        }));
        setMyProjects(projectsWithTasks);

        // progress
        const prog = projectsData.map(p => {
          const pTasks = tasksData.filter(t => t.project_id === p.id);
          const done = pTasks.filter(t => t.status === 'Done').length;
          const total = pTasks.length;
          return {
            name: p.name,
            done,
            total,
            progress: total > 0 ? (done / total) * 100 : 0
          }
        }).sort((a,b) => b.progress - a.progress).slice(0, 5);
        setProjectProgress(prog);

        // Today's tasks (High priority or due today)
        const todayStr = new Date().toISOString().split('T')[0];
        const urgentTasks = tasksData.filter(t => t.status !== 'Done' && (t.priority === 'High' || t.due_date === todayStr)).slice(0, 10).map(t => ({
          ...t,
          project_name: projectsData.find(p => p.id === t.project_id)?.name || 'Unknown'
        }));
        setTodaysTasks(urgentTasks);

      } catch (err: any) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [user]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    try {
      setTodaysTasks(todaysTasks.filter(t => t.id !== taskId));
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
     return <div className="animate-pulse space-y-6">
        <div className="h-[100px] bg-gray-200 rounded-xl"></div>
        <div className="h-[400px] bg-gray-200 rounded-xl"></div>
     </div>;
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Projects', value: stats.totalProjects.toString() },
          { title: 'Active Projects', value: stats.activeProjects.toString() },
          { title: 'Total Tasks', value: stats.totalTasks.toString() },
          { title: 'Task Completion', value: `${stats.completionRate}%` },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 p-5 rounded-2xl flex flex-col justify-between border border-transparent hover:border-lime-500 transition-all">
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>
      
      {/* Row 2: Projects & Tasks */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-gray-900">My Projects</h2>
            <Link to="/projects" className="text-sm text-lime-500 font-semibold hover:underline">View All</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 flex-1">
            {myProjects.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-gray-50 rounded-2xl text-gray-500">
                No projects yet.
              </div>
            ) : myProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onRemove={(id) => {
                  setMyProjects(prev => prev.filter(p => p.id !== id));
                  setStats(prev => ({
                    ...prev,
                    totalProjects: prev.totalProjects - 1,
                    activeProjects: project.status === 'Active' ? prev.activeProjects - 1 : prev.activeProjects,
                  }));
                  setProjectProgress(prev => prev.filter(p => p.name !== project.name));
                }}
                onUpdate={(updated) => {
                  setMyProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
                  setProjectProgress(prev => prev.map(p => p.name === project.name ? { ...p, name: updated.name } : p));
                }}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col bg-gray-50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Tasks</h2>
          <div className="space-y-3 flex-1 overflow-y-auto">
             {todaysTasks.length === 0 ? (
               <div className="text-center text-gray-500 py-4">No urgent tasks due! You're all caught up.</div>
             ) : todaysTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 group">
                  <Checkbox 
                    className="w-5 h-5 rounded border-2 border-gray-300 bg-white flex-shrink-0 group-hover:border-lime-500 data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                    checked={task.status === 'Done'}
                    onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                    <p className="text-[10px] text-gray-500">{task.project_name} {task.priority === 'High' && '• High Priority'}</p>
                  </div>
                  {task.priority === 'High' && <div className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">High</div>}
                  {task.priority === 'Low' && <div className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded">Low</div>}
                </div>
             ))}
          </div>
          <Link to="/tasks" className="mt-4 block text-center w-full py-2 bg-white rounded-xl text-sm font-semibold text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors">
            View All Tasks
          </Link>
        </div>
      </div>

      {/* Row 3: Progress & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-gray-50 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Progress Tracking</h2>
          <div className="space-y-4 cursor-default">
            {projectProgress.length === 0 ? (
               <div className="text-center text-gray-500 py-2 text-sm">No data.</div>
            ) : projectProgress.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-24 truncate font-medium">{p.name}</span>
                <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 bg-lime-500" style={{ width: `${p.progress}%` }}></div>
                </div>
                <span className="text-[10px] font-bold w-8 text-right">{Math.round(p.progress)}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-gray-50 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h2>
          <div className="space-y-3 overflow-hidden h-[120px]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-lime-500"></div>
              <p className="text-xs"><span className="font-bold">AirdropOS</span> loaded successfully</p>
              <span className="ml-auto text-[10px] text-gray-500">Just now</span>
            </div>
            <div className="text-center border border-dashed rounded-xl border-gray-200 text-gray-400 py-4 text-xs mt-2">
               Activity feed tracking coming soon!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
