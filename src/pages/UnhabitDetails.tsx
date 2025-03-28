import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { format, subDays } from 'date-fns';
import { useUnhabitsStore } from '../store/unhabitsStore';
import { TrendingUp as TrendUp, Edit2, ArrowLeft } from 'lucide-react';
import { NotificationToggle } from '../components/NotificationToggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export function UnhabitDetails() {
  const navigate = useNavigate();
  const { unhabitId } = useParams({ from: '/unhabit/$unhabitId' });
  const { unhabits, logs, addLog, updateLog, updateUnhabit } =
    useUnhabitsStore();
  const unhabit = unhabits.find((u) => u.id === unhabitId);
  const [editForm, setEditForm] = useState({
    name: unhabit?.name || '',
    description: unhabit?.description || '',
    target: unhabit?.target || 0,
  });

  if (!unhabit) {
    return <div>Unhabit not found</div>;
  }

  const unhabitLogs = logs
    .filter((log) => log.unhabitId === unhabitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const log = unhabitLogs.find((l) => l.date === date);
    return {
      date,
      count: log?.count || 0,
    };
  }).reverse();

  const todayLog = unhabitLogs.find(
    (log) => log.date === format(new Date(), 'yyyy-MM-dd'),
  );

  const handleIncrement = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (todayLog) {
      // Update existing log
      await updateLog(todayLog.id, todayLog.count + 1);
    } else {
      // Create new log
      await addLog({
        unhabitId,
        date: today,
        count: 1,
      });
    }
  };

  const handleSaveEdit = async () => {
    await updateUnhabit(unhabitId, {
      name: editForm.name,
      description: editForm.description,
      target: editForm.target,
    });
  };

  const handleNotificationToggle = (enabled: boolean, time?: string) => {
    updateUnhabit(unhabitId, {
      notificationEnabled: enabled,
      notificationTime: time || unhabit.notificationTime,
    });
  };

  const averageCount =
    unhabitLogs.reduce((sum, log) => sum + log.count, 0) /
    (unhabitLogs.length || 1);

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex items-center gap-4 mb-8'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>{unhabit.name}</h1>
            <div className='flex items-center gap-2'>
              <NotificationToggle
                unhabit={unhabit}
                onToggle={handleNotificationToggle}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <Edit2 className='h-4 w-4' />
                  </Button>
                </DialogTrigger>
                <DialogContent className='bg-white'>
                  <DialogHeader>
                    <DialogTitle>Edit Unhabit</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Name</label>
                      <Input
                        value={editForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Description</label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Target (per day)
                      </label>
                      <Input
                        type='number'
                        value={editForm.target}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({
                            ...editForm,
                            target: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleSaveEdit} className='w-full'>
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className='text-gray-500 mt-2'>{unhabit.description}</p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Today's Progress</h2>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-4xl font-bold'>{todayLog?.count || 0}</p>
              <p className='text-sm text-gray-500'>occurrences today</p>
            </div>
            <Button
              onClick={handleIncrement}
              className='bg-indigo-600 hover:bg-indigo-700'
            >
              Log Occurrence
            </Button>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Statistics</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>Target</p>
              <p className='text-2xl font-bold'>{unhabit.target}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Average</p>
              <p className='text-2xl font-bold'>{averageCount.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>History</h2>
        <div className='space-y-4'>
          {last7Days.map((day) => (
            <div
              key={day.date}
              className='flex items-center justify-between py-2 border-b last:border-0'
            >
              <div>
                <p className='font-medium'>
                  {format(new Date(day.date), 'EEEE, MMM d')}
                </p>
                <p className='text-sm text-gray-500'>
                  {day.count} occurrence{day.count !== 1 ? 's' : ''}
                </p>
              </div>
              {day.count > 0 && (
                <span className='text-red-500'>
                  <TrendUp className='h-5 w-5' />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
