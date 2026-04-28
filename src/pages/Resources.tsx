import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Database } from '../types/supabase';
import { Card, CardContent } from '../components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

type Resource = Database['public']['Tables']['resources']['Row'] & { project?: { name: string, color_tag: string | null } };

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          project:projects(name, color_tag)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setResources(data as unknown as Resource[]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Resources</h1>
        <p className="text-gray-500">Your saved guides and links across all projects.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>)}
        </div>
      ) : resources.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          No resources found. Edit a project to add some!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(res => (
            <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
              <Card className="h-full hover:border-lime-500 transition-colors">
                <CardContent className="p-4 flex items-start gap-3 flex-col sm:flex-row">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-lime-50 transition-colors shrink-0">
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-lime-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 truncate mb-1" title={res.title}>{res.title}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                       <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{res.type}</Badge>
                       {res.project && (
                         <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${res.project.color_tag}20`, color: res.project.color_tag || '#000' }}>
                           {res.project.name}
                         </span>
                       )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
