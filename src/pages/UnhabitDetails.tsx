import React from 'react';
import { useParams } from '@tanstack/react-router';
import { format, subDays } from 'date-fns';
import { useUnhabitsStore } from '../store/unhabitsStore';
import { LineChart, TrendingUp as TrendUp, TrendingDown as TrendDown } from 'lucide-react';
import { NotificationToggle } from '../components/NotificationToggle';

export function UnhabitDetails() {
  const { unhabitId } = useParams({ from: '/unhabit/$unhabitId' });
  const { unhabits, logs, addLog, updateUnhabit } = useUnhabitsStore();
  const unhabit = unhabits.find((u) => u.id === unhabitId);

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
    (log) => log.date === format(new Date(), 'yyyy-MM-dd')
  );

  const handleIncrement = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (todayLog) {
      // Update existing log
      const updatedLogs = logs.map((log) =>
        log.id === todayLog.id ? { ...log, count: log.count + 1 } : log
      );
      useUnhabitsStore.setState({ logs: updatedLogs });
    } else {
      // Create new log
      addLog({
        unhabitId,
        date: today,
        count: 1,
      });
    }
  };

  const handleNotificationToggle = (enabled: boolean, time?: string) => {
    updateUnhabit(unhabitId, {
      ...unhabit,
      notificationEnabled: enabled,
      notificationTime: time || unhabit.notificationTime,
    });
  };

  const averageCount =
    unhabitLogs.reduce((sum, log) => sum + log.count, 0) / (unhabitLogs.length || 1);

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-3xl font-bold">{unhabit.name}</h1>
        <NotificationToggle unhabit={unhabit} onToggle={handleNotificationToggle} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{todayLog?.count || 0}</p>
              <p className="text-sm text-gray-500">occurrences today</p>
            </div>
            <button
              onClick={handleIncrement}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Log Occurrence
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Target</p>
              <p className="text-2xl font-bold">{unhabit.target}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-2xl font-bold">{averageCount.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <div className="space-y-4">
          {last7Days.map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium">
                  {format(new Date(day.date), 'EEEE, MMM d')}
                </p>
                <p className="text-sm text-gray-500">
                  {day.count} occurrence{day.count !== 1 ? 's' : ''}
                </p>
              </div>
              {day.count > 0 && (
                <span className="text-red-500">
                  <TrendUp className="h-5 w-5" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}