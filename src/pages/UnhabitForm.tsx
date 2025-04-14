import { useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useUnhabitsStore } from '../store/unhabitsStore';

export function UnhabitForm() {
  const navigate = useNavigate();
  const { addUnhabit, fetchUnhabits } = useUnhabitsStore();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      frequency: 'daily',
      target: 0,
    },
    onSubmit: async ({ value }) => {
      await addUnhabit({
        name: value.name,
        description: value.description,
        frequency: value.frequency as 'daily' | 'weekly' | 'monthly',
        target: value.target,
        notificationEnabled: false,
      });
      await fetchUnhabits();
      navigate({ to: '/' });
    },
  });

  return (
    <div className='max-w-2xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8'>Create New Unhabit</h1>

      <form.Provider>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className='space-y-6'
        >
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700'
            >
              Name
            </label>
            <form.Field
              name='name'
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === '') return 'Name is required';
                  if (value.length < 3)
                    return 'Name must be at least 3 characters';
                  if (value.length > 50)
                    return 'Name must be less than 50 characters';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <>
                  <input
                    // @ts-expect-error - field.props is not defined
                    {...field.props}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type='text'
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      field.state.meta.errors
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder='e.g., Reduce Screen Time'
                  />
                  {field.state.meta.errors && (
                    <div className='text-sm text-red-600 mt-1'>
                      {field.state.meta.errors.join(', ')}
                    </div>
                  )}
                </>
              )}
            </form.Field>
          </div>

          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700'
            >
              Description
            </label>
            <form.Field
              name='description'
              validators={{
                onChange: ({ value }) => {
                  if (value && value.length > 500)
                    return 'Description must be less than 500 characters';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <>
                  <textarea
                    // @ts-expect-error - field.props is not defined
                    {...field.props}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={3}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      field.state.meta.errors
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder='Describe your unhabit...'
                  />
                  {field.state.meta.errors && (
                    <div className='text-sm text-red-600 mt-1'>
                      {field.state.meta.errors.join(', ')}
                    </div>
                  )}
                </>
              )}
            </form.Field>
          </div>

          <div>
            <label
              htmlFor='frequency'
              className='block text-sm font-medium text-gray-700'
            >
              Frequency
            </label>
            <form.Field name='frequency'>
              {(field) => (
                <select
                  // @ts-expect-error - field.props is not defined
                  {...field.props}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                >
                  <option value='daily'>Daily</option>
                  <option value='weekly'>Weekly</option>
                  <option value='monthly'>Monthly</option>
                </select>
              )}
            </form.Field>
          </div>

          <div>
            <label
              htmlFor='target'
              className='block text-sm font-medium text-gray-700'
            >
              Target (maximum occurrences)
            </label>
            <form.Field
              name='target'
              validators={{
                onChange: ({ value }) => {
                  const numValue = Number(value);
                  if (isNaN(numValue)) return 'Target must be a number';
                  if (numValue < 0) return 'Target must be a positive number';
                  if (numValue > 1000) return 'Target must be less than 1000';
                  if (!Number.isInteger(numValue))
                    return 'Target must be a whole number';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <>
                  <input
                    // @ts-expect-error - field.props is not defined
                    {...field.props}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    type='number'
                    min='0'
                    max='1000'
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      field.state.meta.errors
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                  />
                  {field.state.meta.errors && (
                    <div className='text-sm text-red-600 mt-1'>
                      {field.state.meta.errors.join(', ')}
                    </div>
                  )}
                </>
              )}
            </form.Field>
          </div>

          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={() => navigate({ to: '/' })}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={form.state.isSubmitting}
            >
              Create Unhabit
            </button>
          </div>
        </form>
      </form.Provider>
    </div>
  );
}
