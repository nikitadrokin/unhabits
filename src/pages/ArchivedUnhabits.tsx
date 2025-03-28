import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useUnhabitsStore } from '../store/unhabitsStore';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function ArchivedUnhabits() {
  const navigate = useNavigate();
  const { archivedUnhabits, loading, fetchArchivedUnhabits, restoreUnhabit } =
    useUnhabitsStore();

  useEffect(() => {
    fetchArchivedUnhabits();
  }, [fetchArchivedUnhabits]);

  const handleRestore = async (id: string) => {
    await restoreUnhabit(id);
    await fetchArchivedUnhabits();
  };

  return (
    <div className='container mx-auto p-4 space-y-4'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-2xl font-bold'>Archived Unhabits</h1>
      </div>

      {loading ? (
        <div className='flex justify-center'>
          <RefreshCw className='h-6 w-6 animate-spin' />
        </div>
      ) : archivedUnhabits.length === 0 ? (
        <div className='text-center text-muted-foreground'>
          No archived unhabits found
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {archivedUnhabits.map((unhabit) => (
            <Card key={unhabit.id}>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>{unhabit.name}</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleRestore(unhabit.id)}
                  >
                    Restore
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>{unhabit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
