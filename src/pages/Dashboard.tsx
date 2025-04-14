import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useUnhabitsStore } from '../store/unhabitsStore';
import { Archive, ArrowRight, Box } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function Dashboard() {
  const { unhabits, logs, archiveUnhabit, fetchUnhabits } = useUnhabitsStore();
  const activeUnhabits = unhabits.filter((u) => !u.archived);

  useEffect(() => {
    fetchUnhabits();
  }, [fetchUnhabits]);

  return (
    <div>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Your Unhabits</h1>
        <Link
          to='/archived'
          className={buttonVariants({
            variant: 'link',
            className: 'text-muted-foreground',
          })}
        >
          <Box className='h-4 w-4' />
          Archived
        </Link>
      </div>

      {activeUnhabits.length === 0 ? (
        <div className='text-center py-12'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No unhabits yet
          </h3>
          <p className='text-gray-500 mb-4'>
            Start by creating your first unhabit to track
          </p>
          <Link
            to='/new'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
          >
            Create Unhabit
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {activeUnhabits.map((unhabit) => {
            const unhabitLogs = logs.filter(
              (log) => log.unhabitId === unhabit.id,
            );
            const todayLog = unhabitLogs.find(
              (log) =>
                new Date(log.date).toDateString() === new Date().toDateString(),
            );

            return (
              <div
                key={unhabit.id}
                className='bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start mb-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    {unhabit.name}
                  </h3>
                  <button
                    onClick={() => archiveUnhabit(unhabit.id)}
                    className='text-gray-400 hover:text-gray-600'
                    title='Archive unhabit'
                  >
                    <Archive className='h-5 w-5' />
                  </button>
                </div>
                <p className='text-gray-600 mb-4'>{unhabit.description}</p>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-sm text-gray-500'>Today's count</p>
                    <p className='text-2xl font-bold'>{todayLog?.count || 0}</p>
                  </div>
                  <Link
                    to='/unhabit/$unhabitId'
                    params={{ unhabitId: unhabit.id }}
                    className={buttonVariants({
                      variant: 'link',
                      className: 'text-indigo-600 hover:text-indigo-700',
                    })}
                  >
                    Details
                    <ArrowRight className='h-4 w-4 ml-1' />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
